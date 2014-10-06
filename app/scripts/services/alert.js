(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name angboardApp.alertService
   * @description
   * # alert
   * Service in the angboardApp.
   */
  angular.module('angboardApp')
    .service('alertService', function ($rootScope) {
      // create an array of alerts available globally
      $rootScope.alerts = [];

      this.add = function (type, msg) {
        // type may be one of 'danger', 'success', 'warning', 'info'
        $rootScope.alerts.push({'type': type, 'msg': msg});
      };

      this.closeAlert = function (index) {
        $rootScope.alerts.splice(index, 1);
      };

      this.clearAlerts = function () {
        $rootScope.alerts.length = 0;
      };
    });
}());