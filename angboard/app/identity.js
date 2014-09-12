// this file has the canonical definition of the module by including
// its dependencies
var appControllers = angular.module('appControllers', []);

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
            $scope.$root.credentials = data;
            apiService.configure($scope.$root.credentials);
            $location.path('/home');
          } else {
            throw 'bad status: ' + status;
          }
        }
      );
    };
  }
]);
