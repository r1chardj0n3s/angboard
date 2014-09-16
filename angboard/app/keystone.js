var appControllers = angular.module('appControllers');


appControllers.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/keystone/login', {
      templateUrl: 'app/partials/keystone_login.html'
    });
  }
]);


appControllers.run([
  'menuService',
  function (menuService) {
    var menu = {'title': 'Identity', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Login', 'action': '#/keystone/login'});
    menu.menus.push({'title': 'Logout', 'action': '#/keystone/logout'});
    menuService.menus.push(menu);
  }
]);


appControllers.controller('LoginCtrl', [
  '$scope', '$location', 'apiService', 'alertService',
  function ($scope, $location, apiService, alertService) {
    $scope.$root.pageHeading = "Login";
    alertService.clearAlerts();

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
            apiService.configure(data);
            $location.path('/home');
          } else {
            throw 'bad status: ' + status;
          }
        }
      );
    };
  }
]);
