'use strict';

var app = angular.module('app');


app.config(function ($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home.html'
  });
});


app.run(function (menuService) {
  var menu = {'title': 'Home', 'action': '#/home'};
  menuService.push(menu);
});


// Login Controller
app.controller('HomeCtrl', function ($scope, apiService, alertService) {
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
});
