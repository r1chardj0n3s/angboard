New dashboard for OpenStack using angularjs talking (almost) directly to the
APIs.

A very quick presentation was given at the 2014 OpenStack Summit to Horizon
developers <http://www.slideshare.net/r1chardj0n3s/angboard>

License
=======

See LICENSE.txt


Installation
============

**Note: requires python3**  (3.4 is recommended)

To set up, first install the following as per your operating system:

1. Python 3
2. virtualenv
3. tox
4. git

And then:

1. `git clone https://github.com/r1chardj0n3s/angboard`
2. `cd angboard`
3. `tox -e grunt -- serve --keystone-url=<URL to keystone>`

This installs all the packages in the `packages.json` file (using npm), the
`bower.json` file (using bower) and the `requirements.txt` (using pip).

The keystone URL should be for your OpenStack installation. For example:

    tox -e grunt -- serve --keystone-url=http://10.0.0.1:5000/v2.0

This will open Chrome (or whatever) to view the site, assuming you did all
that on the same machine that you use as your browsing system. If it was not,
then manually open a browser connection to port 9000 on the system you ran
`grunt serve` on.

Install the "live reload" browser extension / plugin and you'll see your
changes LIVE when you make and save them to disk. Very premium.

If you have an issue with the Flask proxy attempting to run on an already-
used port, you may also specify `--proxy-port` to `grunt serve` to change to
a different port.

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
generator: <https://www.youtube.com/watch?v=gKiaLSJW5xI>. Note that the "yo
angular:controller" and similar commands produce something very nearly
suitable - you'll still need to make some changes to satisfy the code
linting.

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
6. "login" and "logout" events to allow components to initialise themselves
   when the user obtains access credentials / service catalog.

API Services are supported through a pair of a controller and a number of
views.

**angboard components and documentation**

* [AngularJS for application structure](https://docs.angularjs.org/guide)
  and because it's confusing, [here's why ng-model always needs a dotted
  name in itsexpression](http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html)
* [Bootstrap for page construction and layout](http://getbootstrap.com/css/)
* [AngularUI for Angular/Bootstrap integration](http://angular-ui.github.io/bootstrap/)
* [Font Awesome for iconography (class="fa fa-thumbs-up")](http://fortawesome.github.io/Font-Awesome/cheatsheet/)
* [angular-local-storage for in-browser state](https://github.com/grevory/angular-local-storage)
* [angular-smart-table for tables](http://lorenzofox3.github.io/smart-table-website/)
* [less for compiled CSS](http://lesscss.org/)
* [karma test runner](http://karma-runner.github.io/),
  [mocha BDD structure](http://visionmedia.github.io/mocha/)
  and [chai assertions library](http://chaijs.com/api/bdd/)
* [virtualenv - the npm version](https://www.npmjs.org/package/virtualenv)
* [underscore.js](http://underscorejs.org/)


**Notes**

The minification used in our build tool includes `ngmin` support so you don't
need to manually include the DI minification hacks usually needed in
AngularJS applications. This means that instead of having to write this::

  app.service('cinder', ['apiService', '$q'], function cinder(apiService, $q) {

we can just write this::

  app.service('cinder', function cinder(apiService, $q) {

In many views, we hook fetching this data into the route resolution (using
the resolve property) so it's loaded before we switch route to the new page.
This results in less strange variation in loaded pages as data comes in and
also allows nicer sharing of the fetch functionality between uses. For
example, in cinder::

    $routeProvider.when('/cinder/volumes', {
      controller: 'CinderVolumesCtrl',
      templateUrl: 'views/cinder_volumes.html',
      resolve: {
        volumes: function (cinder) {return cinder.volumes(false); }
      }
    });

The volumes data will be loaded before the routing switches view to the new
page.


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

Tools used in maintenance of this application:


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

   You will almost certainly also need to manually add the new JS files to
   the karma test configuration in test/karma.con.js or it will fall about
   laughing.

2. Updating a component:

    bower update <name of component>


grunt
-----

grunt is used as a task management tool. It has a number of tasks defined,
all invokable as `grunt serve` or `grunt build` and so on:

* `serve` the application to a browser (also performs a `watch` and will
  additionally play well with `liveReload` if you have that installed in your
  browser)
* `build` the application for deployment, minifying (HTML, CSS and JS),
  cdn'ing, uglifying and so on and putting everything in the "dist" directory
* `test` to run the test suite under `karma` (using `mocha` and `chai`)
* `watch` for changes in the codebase and take action like compile the CSS
  source files using `less`, or re-run tests. It's automatically included in
  `serve` but if you want automatic re-runnning of tests when you make
  changes and *aren't* using `serve` then `grunt watch` is for you.


jslint
------

In addition to jshint (which picks up on some potential code errors) we also
use jslint to enforce a more strict coding style. It is fired automatically
by "grunt watch" (checking application code as it changes) and "grunt test"
(only checking the tests when they're run).

There are some configuration settings baked into grunt's run:

    browser: true,      // assume the code is running in a browser
    predef: ['angular', 'document'],
    indent: 2,          // 2-space indentation
    vars: true,         // allow multiple var statements in a function
    'continue': true,   // allow use of "continue" keyword in loops (wat)
    plusplus: true      // allow auto-increment (seriously)

If you really need to squash an "unused parameter" message (most likely
because Javascipt doesn't have keyword argument support) then you can surround a block of code with:

    /*jslint unparam: true*/
    ... code with unused parameter ...
    /*jslint unparam: false*/


Inteded Areas Of Development (aka TODO)
=======================================

* menu as variable, not service
* server actions list as variable

* investigate fully external packages extending functionality
* fix the menu
  * admin actions
  * styling
* cover off the OWASP top 10 (at a minimum) where possible/appropriate
  * XSRF per https://docs.angularjs.org/api/ng/service/$http 
* *perhaps* investigate angular strap vs ui-bootstrap
* or https://github.com/angular/material ?
* region selection
* handle multiple endpoints per region
* investigate caching mechanisms
* look into further work refactoring fetching of API data (partial work
  done in nova)
* use [itsdangerous](http://pythonhosted.org/itsdangerous/) to obscure the
  x-auth-token cookie?


Security
========

Specific areas of security that have been addressed:

1. authentication through keystone username/password
2. JSONP vulnerability of APIs in proxy


Tabular Data
============

A bunch of angularjs modules for table support have been tried:

1. ngTable, which is very cumbersome to use, requiring a bunch of manual
   boilerplate in the controller for each table.
2. smart-table which is very promising (except sorting doesn't work at the
   moment)
3. trNgGrid which is simple enough to use, though a little odd and can't
   handle some object attribute names (eg. "OS-FLV-EXT-DATA:ephemeral").
4. ui-grid which is a bit crap in its own way (visually sucky, no real
   integration with bootstrap).

Currently using smart-table.
