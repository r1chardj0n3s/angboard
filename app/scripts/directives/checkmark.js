(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name angboardApp.directive:checkmark
   * @description
   * # checkmark
   */
  angular.module('angboardApp')
    .directive('checkmark', function ($parse) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          attrs.$observe('checkmark', function (checkmark) {
            var checked = $parse(checkmark)(scope);
            if (checked) {
              elem.html('<span class="fa fa-check"></span>');
            } else {
              elem.html('<span class="fa fa-times"></span>');
            }
          });
        }
      };
    });
}());