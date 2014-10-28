(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name angboardApp.controller:CinderCtrl
   * @description
   * # CinderCtrl
   * Controller of the angboardApp
   */
  var app = angular.module('angboardApp');

  app.run(function (menuService) {
    var menu = {'title': 'Block Storage', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Volumes', 'action': '#/cinder/volumes'});
    menuService.push(menu);
  });


  // hook fetching this data into the route resolution so it's loaded before
  // we switch route to the new page; also allows nicer sharing of the fetch
  // functionality between uses
  app.config(function ($routeProvider) {
    $routeProvider.when('/cinder/volumes', {
      controller: 'CinderVolumesCtrl',
      templateUrl: 'views/cinder_volumes.html',
      resolve: {
        volumes: function (cinder) {return cinder.volumes(false); }
      }
    });
  });


  app.controller('CinderVolumesCtrl', function ($scope, volumes, alertService) {
    $scope.$root.pageHeading = 'Volumes';
    alertService.clearAlerts();
    $scope.volumes = volumes;
  });
}());
