/*
Copyright 2014, Rackspace, US, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function () {
  'use strict';

  var app = angular.module('angboardApp', ['ui.bootstrap', 'ngRoute',
    'smart-table', 'LocalStorageModule', 'ngWebsocket', 'ngCookies',
    'pascalprecht.translate']);

  app.config(function ($routeProvider) {
    // set up the default route
    $routeProvider.when('/home', {
      templateUrl: 'views/home.html'
    });
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
  });

  app.run(
    function ($rootScope, $location, $log, apiService, alertService, menuService) {
      // somewhere to put the menu, yes!
      $rootScope.menus = menuService;

      // listen for route changes to ensure we're logged in on all pages except
      // the login page
      $rootScope.$on('$routeChangeStart', function () {
        // set the defaults for the index page elements - these are overridden
        // in the few controllers that need to
        $rootScope.pageHeading = '';
        if (!apiService.access) {
          $log.debug('no access', $location.path());
          if ($location.path() !== '/keystone/logout') {
            $location.path('/keystone/login');
          }
        }
      });

      // root binding for alertService
      $rootScope.closeAlert = alertService.closeAlert;

      // this shouldn't need to be here, but does to make the busy directive
      // successfully show the busy matte, wtf.
      $rootScope.apiService = apiService;
    }
  );
}());