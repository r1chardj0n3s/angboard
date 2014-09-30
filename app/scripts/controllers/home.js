'use strict';

// this file has the canonical definition of the module by including
// its dependencies
var appControllers = angular.module('appControllers', []);


appControllers.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'views/home.html'
    });
  }
]);


appControllers.run([
  'menuService',
  function (menuService) {
    var menu = {'title': 'Home', 'action': '#/home'};
    menuService.push(menu);
  }
]);


// Login Controller
appControllers.controller('HomeCtrl', [
  '$scope', 'apiService', 'alertService',
  function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = 'Home';
    alertService.clearAlerts();

    $scope.apiService = apiService;

    $scope.fetchLimits = function () {
      alertService.clearAlerts();
      apiService.GET(
        'nova',
        'limits',
        function (data) {
          $scope.novaLimits = data;
        }
      );
    };
  }
]);
