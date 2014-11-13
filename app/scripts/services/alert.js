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