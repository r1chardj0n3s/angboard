(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name angboardApp.directive:busy
   * @description
   * # busy
   */

  angular.module('angboardApp')
    .directive('validFile', function () {
      return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
          /*jslint unparam: true */
          //change event is fired when file is selected
          el.bind('change', function () {
            scope.$apply(function () {
              ngModel.$setViewValue(el.val());
              ngModel.$render();
            });
          });
        }
      };
    });
}());