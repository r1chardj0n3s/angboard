#!/usr/bin/env python
import argparse
import functools
import logging
import os
import time
from threading import Thread

from flask import has_request_context, Flask, abort, Response, request

from .proxy import proxy

ALL_HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']


def base_app():
    app = Flask('fauxstack')
    app.config.overrides = {}

    # @app.route('/', methods=['GET'])
    # def index():
    #     with open(os.path.join(FRONTEND_DIR, 'index.html')) as f:
    #         return Response(f.read(), mimetype="text/html")

    @app.route("/shutdown", methods=["POST"])   # pragma: no cover
    def shutdown():  # pragma: no cover
        logging.info('shutting down server')
        shutdown_server()
        return "server shutting down"

    return app


def proxy_app(keystone_url):
    app = base_app()
    proxy.keystone_url = keystone_url
    app.register_blueprint(proxy)
    return app


def abort_app():
    """
    Return error 500 on all requests to /sap
    """
    app = base_app()
    app.config.status_code = 500

    def e500(path):
        abort(app.config.status_code)
    app.route('/keystone/<path:path>', methods=ALL_HTTP_METHODS)(e500)
    return app


def garbage_app():
    """
    Return OK but with garbage content to /sap
    """
    app = base_app()

    def garbage(path):
        return Response("garbage response to %s" % path, status=200,
                        content_type='application/json')
    app.route('/keystone/<path:path>', methods=ALL_HTTP_METHODS)(garbage)
    return app


def shutdown_server():   # pragma: no cover
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()


def setup_logging(filename):    # pragma: no cover
    log_format = '%(asctime)s:%(levelname)s:%(filename)s(%(lineno)d) ' \
        '%(message)s'
    log_level = logging.DEBUG
    logging.basicConfig(format=log_format, level=log_level, filename=filename)
    if filename:
        print('Logging to %s' % filename)


def foreground_runner(app, *args, **kwargs):    # pragma: no cover
    # snippet for debugging w/ wingIDE:
    if __debug__:
        from os import environ
        if 'WINGDB_ACTIVE' in environ:
            app.debug = False
        app.run(*args, **kwargs)


def background_runner(app, *args, **kwargs):    # pragma: no cover
    kwargs["use_reloader"] = False
    
    # snippet for debugging w/ wingIDE:
    if __debug__:
        from os import environ
        if 'WINGDB_ACTIVE' in environ:
            kwargs["debug"] = False    
    else:
        kwargs["debug"] = True
    process = Thread(target=app.run, args=args, kwargs=kwargs,
            daemon=False)
    process.start()
    import ipdb
    ipdb.set_trace()


def delay_response(delay):
    if has_request_context():
        if request.path.lower().startswith(''):
            logging.info('Delaying response by %s seconds', delay)
            time.sleep(delay)


def main():  # pragma: no cover
    parser = argparse.ArgumentParser(description='OpenStack Dashboard webapp')
    backend_target_group = parser.add_mutually_exclusive_group()
    parser.add_argument('proxy', metavar='HOST', type=str, nargs=1,
        help='URL of keystone API to proxy to')
    backend_target_group.add_argument(
        '--ipdb', action='store_true',
        help='Execute in the background and start ipdb')
    backend_target_group.add_argument(
        '--simulator', action='store_true',
        help='Run against the simulator')
    backend_target_group.add_argument(
        '--abort500', action='store_true',
        help='Run against an stack that aborts with 500')
    backend_target_group.add_argument(
        '--garbage', action='store_true',
        help='Run against a stack that returns 200 but garbage content')
    parser.add_argument(
        '--delay', metavar='n', type=int, default=0,
        help='Seconds to wait before processing each request')
    parser.add_argument(
        '--port', '-P', type=int, default=8531,
        help='Port to serve the backend on')
    parser.add_argument(
        '--host', '-H', default="0.0.0.0",
        help='IP or hostname to serve on')
    parser.add_argument(
        '--log', '-l', default=None,
        help='File to log messages to')
    parser.set_defaults(simulator=True)
    args = parser.parse_args()

    runner = foreground_runner
    if args.ipdb:
        runner = background_runner

    runner_kw = {
        'host': args.host,
        'port': args.port,
        'debug': True,
        'host': '0.0.0.0'
    }

    if __debug__:
        from os import environ
        if 'WINGDB_ACTIVE' in environ:
            runner_kw["debug"] = False    

    setup_logging(args.log)

    if args.proxy:
        logging.info("Using real backend")
        app = proxy_app(args.proxy[0])
    elif args.abort500:
        logging.info("Backend will return 500 on every call")
        app = abort_app()
    elif args.garbage:
        logging.info("Backend returns ok but garbage content on every call")
        app = garbage_app()

    if args.delay > 0:
        logging.info("Delaying by %s seconds prior to response" % args.delay)
        runner_kw['threaded'] = True
        app.before_request(functools.partial(delay_response, args.delay))

    runner(app=app, **runner_kw)

if __name__ == '__main__':  # pragma: no cover
    main()
