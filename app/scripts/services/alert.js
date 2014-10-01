'use strict';

/**
 * @ngdoc service
 * @name app.alertService
 * @description
 * # alert
 * Service in the app.
 */
angular.module('app')
  .service('alertService', function ($rootScope) {
    // create an array of alerts available globally
    $rootScope.alerts = [];

    this.add = function (type, msg) {
      // type may be one of 'error', 'success', 'warning', 'info'
      $rootScope.alerts.push({'type': type, 'msg': msg});
    };

    this.closeAlert = function (index) {
      $rootScope.alerts.splice(index, 1);
    };

    this.clearAlerts = function () {
      $rootScope.alerts.length = 0;
    };
  });
