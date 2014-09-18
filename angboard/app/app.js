var modules = [
  'ui.bootstrap',
  'ngRoute',
  'appControllers',
  'appServices',
  'ngTable'
];

var app = angular.module('app', modules);

app.config([
  '$routeProvider',
  function ($routeProvider) {
    // set up the default route
    $routeProvider.when('/home', {
      templateUrl: 'app/partials/home.html'
    });
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
  }
]);


app.run([
  '$rootScope', '$location', '$log', 'apiService', 'alertService', 'menuService',
  function ($rootScope, $location, $log, apiService, alertService, menuService) {
    // somewhere to put the menu, yes!
    $rootScope.menus = menuService;

    // listen for route changes to ensure we're logged in on all pages except
    // the login page
    /*jslint unparam: true*/
    $rootScope.$on("$routeChangeStart", function (event, next) {
      // set the defaults for the index page elements - these are overridden
      // in the few controllers that need to
      $rootScope.showNavBar = true;
      $rootScope.pageSubTitle = '';
      if (!apiService.authenticated()) {
        $log.debug($location.path());
        if ($location.path() !== "/keystone/logout") {
          $location.path("/keystone/login");
        }
      }
    });

    // root binding for alertService
    $rootScope.closeAlert = alertService.closeAlert;

    // XXX debugging, remove me
    $rootScope.apiService = apiService;
  }
]);
