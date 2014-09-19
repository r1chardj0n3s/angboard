var appControllers = angular.module('appControllers');


appControllers.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/keystone/login', {
      templateUrl: 'app/partials/keystone_login.html'
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
  }
]);


appControllers.run([
  'menuService', 'apiService',
  function (menuService, apiService) {
    var menu = {'title': 'Identity', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Login', 'action': '#/keystone/login',
      'show': function () {return !apiService.is_authenticated; }});
    menu.menus.push({'title': 'Logout', 'action': '#/keystone/logout',
      'show': function () {return apiService.is_authenticated; }});
    menuService.menus.push(menu);
  }
]);


appControllers.controller('LoginCtrl', [
  '$scope', '$location', 'apiService', 'alertService', 'menuService',
  function ($scope, $location, apiService, alertService, menuService) {
    $scope.$root.pageHeading = "Login";
    alertService.clearAlerts();
    menuService.visible = false;

    $scope.tenantName = 'demo';
    $scope.username = 'admin';
    $scope.password = 'secrete';

    $scope.login = function () {
      alertService.clearAlerts();
      alertService.add('info', 'Hello, World!');

      apiService.POST(
        'keystone',
        "tokens",
        {
          "auth": {
            "tenantName": $scope.tenantName,
            "passwordCredentials": {
              "username": $scope.username,
              "password": $scope.password
            }
          }
        },
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
  }
]);
