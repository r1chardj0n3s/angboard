New dashboard for OpenStack using angularjs talking directly to the APIs.

This is currently *very* raw, proof-of-concept. You can authenticate and
hit *one* nova API call using those credentials.


To set up:

  mkvirtualenv angboard
  pip install -r requirements.txt

And then:

  ./run <URL to keystone API>

For example, given devstack on 10.0.0.1:

  ./run http://10.0.0.1:5000/v2.0


Application Structure
=====================

This repository contains two applications:

1. fauxstack, which either proxies API requests to an OpenStack installation
   (this is "live" mode) and will also provide fake responses to allow
   development without requiring an OpenStack installation.
2. angboard, which is the Javascript application providing the dashboard for
   OpenStack using angularjs and bootstrap.

The fauxstack proxy is intentionally very thin and should have as little
knowledge about APIs as possible built into it. The keystone service catalog
is the one exception since it needs to know about that to perform the proxied
API calls.

The proxy maps using service endpoint names, allowing exposure of all of the
compute APIs, for example. The URL structure exposed by the proxy is:

    /service_name/region/api_path

The publicURL for the service_name / region is looked up in the
service catalog, and the call is made using:

    publicURL/api_path

If there's more than one endpoint per region then we just choose the first
at the moment; using multiple is outside the scope of this prototype.

The angboard application has the following structure:

1. app.js which is the root application; this file should be as small as
   possible. If you add functionality to the $rootScope, consider whether it
   might be made a service instead.
2. the "home" page, providing a default view in the absence of other views.
3. the keystone service, providing login and logout. It is registered the
   same way as other API services, but various parts of the application
   assume to provide the "/keystone/login" URL.
4. other services implemented as a "service_name.js" which extends the
   appControllers module, the $routeProvider and the menuService. Such
   services should also be added to the <link> list in index.html.
5. all API-calling functionality is implemented in the apiService which also
   handles storing the auth token.


Components
----------

* AngularJS, Bootstrap are straight-forward.
* Bootstrap-UI for Angular/Bootstrap integration.
* angular-local-storage from https://github.com/grevory/angular-local-storage
* underscore.js for many convenience functions (for a python programmer)
* ng-table from https://github.com/esvit/ng-table


Inteded Areas Of Development (aka TODO)
=======================================

* fix the menu
  * admin actions
  * modify elements for context (login/logout, service catalog)
  * stylings
* cover off the OWASP top 10 (at a minimum) where possible/appropriate
  * XSRF per https://docs.angularjs.org/api/ng/service/$http 
* implement creation and management of nova instances
* *perhaps* investigate angular strap vs ui-bootstrap
* region selection
* handle multiple endpoints per region

Security
========

Specific areas of security that have been addressed:

1. authentication through keystone username/password
2. JSONP vulnerability of APIs in proxy
