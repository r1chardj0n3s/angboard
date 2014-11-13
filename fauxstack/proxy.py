# Copyright 2014, Rackspace, US, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# pragma: no cover
import logging
import posixpath

import requests

from flask import Blueprint, request, Response
from werkzeug.datastructures import Headers
from werkzeug import exceptions

proxy = Blueprint('proxy', __name__)

log = logging.getLogger(__name__)

user_mappings = {}


@proxy.route('/api/<service>/<region>/',
             methods=["GET", "POST", "HEAD", "PUT"],
             defaults={'file': None})
@proxy.route('/api/<service>/<region>/<path:file>',
             methods=["GET", "POST", "DELETE", "PUT", "COPY"])
def proxy_request(service, region, file):
    # a few headers to pass on
    request_headers = {}

    for h in ['X-Requested-With', 'Authorization', 'Accept', 'Content-Type',
            'X-Container-Read', 'Destination']:
        if h in request.headers:
            request_headers[h] = request.headers[h]

    # as well as the above, swift allows setting meta data on objects.
    # any key starting with X-Object-Meta- should be allowed.
    for h in request.headers:
        if h[0].startswith('X-Object-Meta-'):
            request_headers[h[0]] = request.headers[h[0]]

    access_token = request.cookies.get('x-auth-token')
    if access_token:
        request_headers['X-Auth-Token'] = access_token

    if request.query_string:
        path = "%s?%s" % (file, request.query_string.decode('utf8'))
    else:
        path = file

    if request.method in ("POST", "PUT"):
        request_data = request.data
        
        if not 'Content-Type' in request_headers:
            request_headers["Content-Type"] = 'application/json'
    else:
        request_data = None

    if service == 'keystone':
        url = posixpath.join(proxy.keystone_url, path)
    else:
        if not access_token:
            raise exceptions.Unauthorized('no x-auth-token')
        if access_token not in user_mappings:
            raise exceptions.Unauthorized('invalid x-auth-token')

        log.debug(user_mappings[access_token][service])
        mapped = user_mappings[access_token][service][region][0]['publicURL']

        if path:
            # swift account operations do not specify a path
            url = posixpath.join(mapped, path)
        else:
            url = mapped

    log.info('ATTEMPTING to %s\n\tURL %s\n\tWITH headers=%s\n\tDATA=%s',
             request.method, url, request_headers, request_data if request_data and len(request_data) < 2000 else '...')

    if request.method == 'GET':
        upstream = requests.get(url, headers=request_headers)
    elif request.method == 'DELETE':
        upstream = requests.delete(url, headers=request_headers)
    elif request.method == 'HEAD':
        upstream = requests.head(url, headers=request_headers)
    elif request.method == 'POST':
        upstream = requests.post(url, data=request_data,
            headers=request_headers)
    elif request.method == 'PUT':
        upstream = requests.put(url, data=request_data,
            headers=request_headers)
    elif request.method == 'COPY':
        upstream = requests.request('copy', url, data=request_data,
            headers=request_headers)
    else:
        raise ValueError('Unhandled request.method (%s)' % request.method)

    # Clean up response headers for forwarding
    response_headers = Headers()
    for key in upstream.headers:
        if key.lower() in ["content-length", "connection"]:
            continue
        response_headers[key] = upstream.headers[key]

    # JSON responses require special handling (or more to the point jpegs
    # get upset if you treat them as if they were json)
    
       
    if 'Content-Type' in upstream.headers and \
       upstream.headers['Content-Type'] == 'application/json':
        
        log.info('RESPONSE: %s %s\n%s', upstream.status_code, 
                response_headers, upstream.text) 

        response_text = response=")]}',\n" + upstream.text
    else:
#        response_text = upstream.text
        response_text = upstream.content
        
    # return the response plus the JSONP protection
    # (https://docs.angularjs.org/api/ng/service/$http)
    response = Response(response_text,
                        status=upstream.status_code,
                        headers=response_headers,
                        content_type=upstream.headers['Content-Type'])

    # spy on serviceCatalog responses
    if service == 'keystone' and file == 'tokens' and \
       upstream.status_code == 200:
        log.info('got a service catalog response; mapping')
        data = upstream.json()

        access_token = data['access']['token']['id']
        response.set_cookie('x-auth-token', access_token)
        for service in data['access']['serviceCatalog']:
            mapping = user_mappings.setdefault(access_token, {})
            s = mapping[service['name']] = {}
            for endpoint in service['endpoints']:
                s.setdefault(endpoint['region'], []).append(endpoint)

    return response
