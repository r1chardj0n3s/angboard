# pragma: no cover
import logging
import posixpath

import requests

from flask import Blueprint, request, Response
from werkzeug.datastructures import Headers

proxy = Blueprint('proxy', __name__)

log = logging.getLogger(__name__)

mapping = {}


def update_mapping(data):
    for service in data['access']['serviceCatalog']:
        for endpoint in service['endpoints']:
            # obvs. handle REGION here
            log.info('adding %s->%s', service['name'], endpoint['publicURL'])
            mapping[service['name']] = endpoint['publicURL']


@proxy.route('/<service>/<path:file>', methods=["GET", "POST"])
def proxy_request(service, file):
    # a few headers to pass on
    request_headers = {}
    # XXX Cookie?
    for h in ['X-Requested-With', 'Authorization', 'Accept', 'X-Auth-Token']:
        if h in request.headers:
            request_headers[h] = request.headers[h]

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
        mapped = mapping[service]
        url = posixpath.join(mapped, path)

    log.info('ATTEMPTING to %s\n\tURL %s\n\tWITH headers=%s and data=%s',
             request.method, url, request_headers, request_data)

    if request.method == 'GET':
        resp = requests.get(url, headers=request_headers)
    else:
        resp = requests.post(url, data=request_data, headers=request_headers)

    # Clean up response headers for forwarding
    response_headers = Headers()
    for key in resp.headers:
        if key.lower() in ["content-length", "connection"]:
            continue
        response_headers[key] = resp.headers[key]

    # spy on serviceCatalog responses
    if service == 'keystone' and file == 'tokens' and resp.status_code == 200:
        update_mapping(resp.json())

    log.info('RESPONSE: %s %s\n%s', resp.status_code, response_headers,
        resp.text)

    return Response(response=resp.text,
                    status=resp.status_code,
                    headers=response_headers,
                    content_type=resp.headers['Content-Type'])
