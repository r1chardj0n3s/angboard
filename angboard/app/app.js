var modules = [
  'ui.bootstrap',
  'ngRoute',
  'ngCookies',
  'appControllers',
  'appServices',
  'ngTable'
];

var app = angular.module('app', modules);

app.config(['$routeProvider',
  function ($routeProvider) {
    var partials = [
      'login', 'home'
    ];
    angular.forEach(partials, function (partial) {
      $routeProvider.when('/' + partial, {
        templateUrl: 'app/partials/' + partial + '.html'
      });
    });

    $routeProvider.otherwise({
      redirectTo: '/home'
    });
  }]);


app.run([
  '$rootScope', '$cookies', '$location', '$log', '$cookieStore', 'apiService', 'alertService',
  function ($rootScope, $cookies, $location, $log, $cookieStore, apiService, alertService) {
    // listen for route changes to ensure we're logged in on all pages except
    // the login page
    /*jslint unparam: true*/
    $rootScope.$on("$routeChangeStart", function (event, next) {
      var auth_token = $cookieStore.get('x-auth-token');
      if (auth_token) {
        apiService.ensureServiceCatalog();
      }

      // set the defaults for the index page elements - these are overridden
      // in the few controllers that need to
      $rootScope.showNavBar = true;
      $rootScope.pageSubTitle = '';
      if (!apiService.authenticated()) {
        $log.debug($location.path());
        if ($location.path() !== "/logout") {
          $location.path("/login");
        }
      }
    });

    // root binding for alertService
    $rootScope.closeAlert = alertService.closeAlert;

    // XXX debugging, remove me
    $rootScope.apiService = apiService;
    $rootScope.cookies = $cookieStore;
  }
]);
