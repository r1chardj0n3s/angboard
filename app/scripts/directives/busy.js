(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name angboardApp.directive:busy
   * @description
   * # busy
   */
  angular.module('angboardApp')
    .directive('busy', function (apiService) {
      return {
        template: '<div id="spinner" ng-show="apiService.busy.count">' +
          '<div ng-transclude></div></div>',
        apiService: apiService,
        restrict: 'E',
        replace: true,
        transclude: true
      };
    });
}());