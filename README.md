New dashboard for OpenStack using angularjs talking directly to the APIs.

This is currently *very* raw, proof-of-concept.

To set up:

    git clone https://github.com/r1chardj0n3s/angboard
    cd angboard
    mkvirtualenv angboard
    source angboard/bin/activate
    pip install -r requirements.txt

And then:

    source angboard/bin/activate
    ./run <URL to keystone API>

For example, given devstack on 10.0.0.1:

    ./run http://10.0.0.1:5000/v2.0

And then set up the Javascript stuff with (note: I assume you have npm
installed):

    sudo npm install -g grunt bower
    bower install

Once that's running, use a separate shell to fire up the grunt server:

    grunt serve

This will open Chrome (or whatever) to view the site. Install the "live
reload" browser extension / plugin and you'll see your changes LIVE when you
make and save them to disk. Very premium.

Keep an eye on the "grunt serve" window - it'll beep when you violate the
Javascript style guide.


Application Structure
=====================

This repository contains two applications:

1. the Javascript application in "app" providing the dashboard for
   OpenStack using angularjs and bootstrap.
2. "fauxstack", which proxies API requests to an OpenStack installation
   (this is "live" mode) and will eventually also provide fake responses
   to allow development without requiring an OpenStack installation.

angboard (ANGular dashBOARD)
----------------------------

The angboard application has a structure created by the angularjs generator
at <https://github.com/yeoman/generator-angular>. For some background on how
yoeman works, this is a nice introduction though it uses a different
generator: <https://www.youtube.com/watch?v=gKiaLSJW5xI>

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

API Services are supported through a pair of a controller and a number of
views.

**angboard components**

* AngularJS, Bootstrap are straight-forward.
* Bootstrap-UI for Angular/Bootstrap integration.
* angular-local-storage from https://github.com/grevory/angular-local-storage
* underscore.js for many convenience functions (for a python programmer)
* angular-smart-table for tables

Note that the minification used in our build tool includes `ngmin` support so
you don't need to manually include the DI minification hacks usually needed
in AngularJS applications.


fauxstack (fake OpenStack)
--------------------------

The fauxstack proxy is intentionally very thin and should have as little
knowledge about APIs as possible built into it. The keystone service catalog
is the one exception since it needs to know about that to perform the proxied
API calls.

The proxy maps using service endpoint names, allowing exposure of all of the
compute APIs, for example. The URL structure exposed by the proxy is:

    /api/service_name/region/api_path

The publicURL for the service_name / region is looked up in the
service catalog, and the call is made using:

    publicURL/api_path

If there's more than one endpoint per region then we just choose the first
at the moment; using multiple is outside the scope of this prototype.


Tools
=====

Several tools are used in maintenance of this application:

bower
-----

bower is used to install and update components. It is written in the node.js
programming language, but we don't need to worry about that. Two operations
that might be needed are:

1. Installing a new component to use in the application. This is done using:

    bower install <name of component> -S

   The "-S" adds the component to the bower.json file so it's installed when
   "bower install" is invoked with no arguments. Good for deployment to a new
   environment.

   When a new Javascript or CSS component is installed, you should check that
   it is included in the appropriate index.html section. Usually this should
   happen automatically.

2. Updating a component. This is quite easy:

    bower update <name of component>

grunt
-----

grunt is used as a task management tool. It has a number of tasks defined,
all invokable as `grunt serve` or `grunt build` and so on:

* `watch` for changes in the codebase and take action like compile the sass
  CSS source files using `compass`.
* `serve` the application to a browser (also performs a `watch` and will
  additionally play well with `liveReload` if you have that installed in your
  browser)
* `test` to run the test suite under `karma`
* `build` the application for deployment, minifying (HTML, CSS and JS),
  cdn'ing, uglifying and so on and putting everything in the "dist" directory


Inteded Areas Of Development (aka TODO)
=======================================

* implement a single test

and

* fix the menu
  * admin actions
  * modify contents for service catalog
  * styling
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



Tabular Data
============

Three angularjs modules for table support have been tried:

1. ngTable, which is very cumbersome to use, requiring a bunch of manual
   boilerplate in the controller for each table.
2. smart-table which is very promising (except sorting doesn't work at the
   moment)
3. trNgGrid which is simple enough to use, though a little odd and can't
   handle some object attribute names (eg. "OS-FLV-EXT-DATA:ephemeral").
4. ui-grid which is a bit crap in its own way (visually sucky, no real
   integration with bootstrap).

Currently using smart-table.
