/*
Copyright 2014, Rackspace, US, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
