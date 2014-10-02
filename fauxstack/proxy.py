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
             methods=["GET", "POST", "HEAD"],
             defaults={'file':None})
@proxy.route('/api/<service>/<region>/<path:file>',
             methods=["GET", "POST"])
def proxy_request(service, region, file):
    # a few headers to pass on
    request_headers = {}

    for h in ['X-Requested-With', 'Authorization', 'Accept', 'X-Auth-Token']:
        if h in request.headers:
            request_headers[h] = request.headers[h]

    access_token = request.headers.get('X-Auth-Token')

    if request.query_string:
        path = "%s?%s" % (file, request.query_string.decode('utf8'))
    else:
        path = file

    if request.method == "POST":
        request_data = request.data
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

    log.info('ATTEMPTING to %s\n\tURL %s\n\tWITH headers=%s and data=%s',
             request.method, url, request_headers, request_data)

    if request.method == 'GET':
        upstream = requests.get(url, headers=request_headers)
    else:
        upstream = requests.post(url, data=request_data,
                                 headers=request_headers)

    # Clean up response headers for forwarding
    response_headers = Headers()
    for key in upstream.headers:
        if key.lower() in ["content-length", "connection"]:
            continue
        response_headers[key] = upstream.headers[key]

    log.info('RESPONSE: %s %s\n%s', upstream.status_code, response_headers,
             upstream.text)

    # return the response plus the JSONP protection
    # (https://docs.angularjs.org/api/ng/service/$http)
    response = Response(response=")]}',\n" + upstream.text,
                        status=upstream.status_code,
                        headers=response_headers,
                        content_type=upstream.headers['Content-Type'])

    # spy on serviceCatalog responses
    if service == 'keystone' and file == 'tokens' and \
       upstream.status_code == 200:
        log.info('got a service catalog response; mapping')
        data = upstream.json()

        access_token = data['access']['token']['id']
        for service in data['access']['serviceCatalog']:
            mapping = user_mappings.setdefault(access_token, {})
            s = mapping[service['name']] = {}
            for endpoint in service['endpoints']:
                s.setdefault(endpoint['region'], []).append(endpoint)

    return response
