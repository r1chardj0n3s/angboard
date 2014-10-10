(function () {
  'use strict';

  var app = angular.module('angboardApp');


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
  app.controller('HomeCtrl', function ($scope, apiService) {
    $scope.$root.pageHeading = 'Home';
    apiService.GET(
      'nova',
      'limits',
      function (data) {
        $scope.limits = data.limits.absolute;
      }
    );
  });
}());
