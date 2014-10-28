(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name angboardApp.directive:busy
   * @description
   * # busy
   */
  angular.module('angboardApp')
    .directive('fileread', function () {
      return {
        require: 'ngModel',
        scope: {
          fileread: '='
        },
        link: function (scope, element, attrs, ngModel) {
          element.bind('change', function (changeEvent) {

            scope.$apply(function () {
              scope.fileread = changeEvent.target.files[0];
              ngModel.$setViewValue(element.val());
            });
          });
        }
      };
    });
}());

