(function () {
  'use strict';

  angular.module('angboardApp').controller('ModalCtrl', function ($scope, $modalInstance, data) {
    $scope.data = data;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
}());