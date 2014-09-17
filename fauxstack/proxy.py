# pragma: no cover
import json
import logging
import posixpath

import requests

from flask import Blueprint, request, Response, jsonify
from werkzeug.datastructures import Headers
from werkzeug import exceptions

proxy = Blueprint('proxy', __name__)

log = logging.getLogger(__name__)

user_mappings = {}
service_catalogs = {}


def get_access_token():
    access_token = request.cookies.get('x-auth-token')
    if not access_token:
        return None
    log.debug('got x-auth-token %r', access_token)
    return json.loads(access_token)['token']


@proxy.route('/:service_catalog:/', methods=["GET"])
def service_catalog():
    access_token = get_access_token()
    if not access_token:
        log.debug('/:service_catalog:/ with no x-auth-token cookie')
        return jsonify({'status': 'error', 'reason': 'no x-auth-token cookie'})

    if access_token not in service_catalogs:
        log.debug('/:service_catalog:/ with invalid x-auth-token cookie')
        return jsonify({
            'status': 'error',
            'reason': 'invalid x-auth-token cookie'
        })

    return jsonify({'status': 'ok', 'data': service_catalogs[access_token]})


@proxy.route('/:logout:/', methods=["GET"])
def logout():
    access_token = get_access_token()
    if not access_token:
        return jsonify({'status': 'ok'})

    if access_token in service_catalogs:
        del service_catalogs[access_token]

    response = jsonify({'status': 'ok'})
    response.set_cookie('x-auth-token', '', expires=0)
    return response


@proxy.route('/<service>/<int:endpoint>/<path:file>',
             methods=["GET", "POST"])
def proxy_request(service, endpoint, file):
    # a few headers to pass on
    request_headers = {}

    for h in ['X-Requested-With', 'Authorization', 'Accept']:
        if h in request.headers:
            request_headers[h] = request.headers[h]

    access_token = get_access_token()
    if access_token:
        request_headers['X-Auth-Token'] = access_token

        if access_token not in user_mappings:
            raise exceptions.Forbidden('invalid x-auth-token')

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
            raise exceptions.Forbidden('no x-auth-token')
        mapped = user_mappings[access_token][service][endpoint]['publicURL']
        url = posixpath.join(mapped, path)

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
        log.info('got a service catalog response, mapping and cookie')
        data = upstream.json()

        access_token = data['access']['token']['id']
        response.set_cookie('x-auth-token',
                            json.dumps({'token': access_token}))
        service_catalogs[access_token] = data

        for service in data['access']['serviceCatalog']:
            mapping = user_mappings.setdefault(access_token, {})
            mapping[service['name']] = service['endpoints']

    return response
