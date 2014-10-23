(function () {
  'use strict';

  var app = angular.module('angboardApp');


  app.config(function ($routeProvider) {
    $routeProvider.when('/home', {
      controller: 'HomeCtrl',
      templateUrl: 'views/home.html',
      resolve: {
        limits: function (nova) {return nova.limits(); }
      }
    });
  });


  app.run(function (menuService) {
    var menu = {'title': 'Home', 'action': '#/home'};
    menuService.push(menu);
  });


  // Login Controller
  app.controller('HomeCtrl', function ($scope, limits) {
    $scope.$root.pageHeading = 'Home';
    $scope.limits = limits.absolute;
  });
}());
