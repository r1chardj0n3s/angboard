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