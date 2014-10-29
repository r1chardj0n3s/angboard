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