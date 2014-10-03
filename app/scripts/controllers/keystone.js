(function () {
  'use strict';

  var app = angular.module('angboardApp');


  app.config(function ($routeProvider) {
    $routeProvider.when('/keystone/login', {
      templateUrl: 'views/keystone_login.html'
    });

    $routeProvider.when('/keystone/logout', {
      resolve: {
        redirect: [
          '$location', '$log', 'apiService',
          function ($location, $log, apiService) {
            $log.info('log out');
            apiService.clearAccess('logout');
            $location.path('/keystone/login');
          }
        ]
      }
    });
  });


  app.run(function (menuService, apiService) {
    var menu = {'title': 'Identity', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Login', 'action': '#/keystone/login',
      'show': function () {return !apiService.access; }});
    menu.menus.push({'title': 'Logout', 'action': '#/keystone/logout',
      'show': function () {return apiService.access; }});
    menuService.push(menu);
  });


  app.controller('LoginCtrl',
    function ($scope, $location, apiService, alertService, menuService) {
      $scope.$root.pageHeading = 'Login';
      alertService.clearAlerts();
      menuService.visible = false;

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
            alertService.add('info', 'Hello:' + angular.toJson(data));
            if (status === 200) {
              apiService.setAccess(data.access);
              $location.path('/home');
              menuService.visible = true;
            } else {
              throw 'bad status: ' + status;
            }
          }
        );
      };
    });
}());