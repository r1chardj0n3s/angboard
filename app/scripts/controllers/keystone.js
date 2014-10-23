(function () {
  'use strict';

  var app = angular.module('angboardApp');


  app.config(function ($routeProvider) {
    $routeProvider.when('/keystone/login', {
      templateUrl: 'views/keystone_login.html'
    });

    $routeProvider.when('/keystone/details', {
      templateUrl: 'views/keystone_details.html'
    });

    $routeProvider.when('/keystone/logout', {
      resolve: {
        redirect:
          function ($rootScope, $location, $log, $cookieStore, apiService) {
            $log.info('log out');
            $rootScope.$emit('logout');
            $cookieStore.remove('x-auth-token');
            apiService.clearAccess('logout');
            $location.path('/keystone/login');
          }
      }
    });
  });


  app.run(function (menuService, apiService) {
    var menu = {'title': 'Identity', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Login', 'action': '#/keystone/login',
      'show': function () {return !apiService.access; }});
    menu.menus.push({'title': 'Details', 'action': '#/keystone/details',
      'show': function () {return apiService.access; }});
    menu.menus.push({'title': 'Logout', 'action': '#/keystone/logout',
      'show': function () {return apiService.access; }});
    menuService.push(menu);
  });

  app.controller('DetailsCtrl',
    function ($scope, apiService) {
      $scope.$root.pageHeading = 'Access Details';
      $scope.apiService = apiService;
      $scope.invalidateToken = function () {
        apiService.access.token.id = 'invalid';
      };
    });

  app.controller('LoginCtrl',
    function ($scope, $location, $log, apiService, alertService, menuService) {
      $scope.$root.pageHeading = 'Login';
      menuService.visible = false;
      // we might have been forced here so forcibly reset busy to sane state
      apiService.busy = {count: 0};
      $log.debug('busy = 0');

      $scope.auth = {
        'tenantName': 'demo',
        'passwordCredentials': {
          'username': 'admin',
          'password': 'secrete'
        }
      };

      $scope.login = function () {
        alertService.clearAlerts();
        apiService.POST(
          'keystone',
          'tokens',
          {'auth': $scope.auth},
          function (data, status) {
            if (status === 200) {
              // do this immediately, since some of the login event listeners
              // require it
              apiService.setAccess(data.access);
              $scope.$emit('login', data.access);
              $location.path('/home');
            } else {
              throw 'bad status: ' + status;
            }
          }
        );
      };
    });
}());