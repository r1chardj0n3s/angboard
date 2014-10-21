(function () {
  'use strict';

  var app = angular.module('angboardApp');


  app.config(function ($routeProvider) {
    $routeProvider.when('/home', {
      controller: 'HomeCtrl',
      templateUrl: 'views/home.html',
      resolve: {
        limits: function (apiService, $q) {
          var defer = $q.defer();
          apiService.GET('nova', 'limits', function (data) {
            defer.resolve(data.limits.absolute);
          });
          return defer.promise;
        }
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
    $scope.limits = limits;
  });
}());
