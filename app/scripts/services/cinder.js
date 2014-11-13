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
   * @name angboardApp.cinder
   * @description
   * # cinder
   * Service in the angboardApp.
   */
  var app = angular.module('angboardApp');

  app.service('cinder', function cinder(apiService, $q) {
    var self = this;

    var fetch = function (name, url, showSpinner) {
      if (!angular.isDefined(showSpinner)) {
        showSpinner = true;
      }
      var defer = $q.defer();
      apiService.GET('cinder', url, function (data) {
        defer.resolve(data[name]);
      }, {showSpinner: showSpinner});
      return defer.promise;
    };


    self.volumes = function (showSpinner) {
      return fetch('volumes', 'volumes/detail', showSpinner);
    };

  });
}());