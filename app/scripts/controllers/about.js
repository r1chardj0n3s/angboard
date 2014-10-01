'use strict';

/**
 * @ngdoc function
 * @name angboardApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the angboardApp
 */
angular.module('angboardApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
