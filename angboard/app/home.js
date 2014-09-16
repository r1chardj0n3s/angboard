var appControllers = angular.module('appControllers');

// Login Controller
appControllers.controller('HomeCtrl', [
  '$scope', 'apiService', 'alertService',
  function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = "Home";
    alertService.clearAlerts();

    $scope.apiService = apiService;

    $scope.fetchLimits = function () {
      alertService.clearAlerts();
      apiService.GET(
        'nova',
        "limits",
        function (data) {
          $scope.nova_limits = data;
        }
      );
    };
  }
]);
