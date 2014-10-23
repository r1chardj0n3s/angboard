(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name angboardApp.nova
   * @description
   * # nova
   * Service in the angboardApp.
   */
  var app = angular.module('angboardApp');

  function updateArray(current, updates) {
    var i, updateMap = {}, currentId, updateId;
    angular.forEach(updates, function (update) {
      updateMap[update.id] = update;
    });
    for (i = 0; i < current.length; i++) {
      currentId = current[i].id;
      if (updateMap.hasOwnProperty(currentId) && updateMap[currentId].status !== 'DELETED') {
        current[i] = updateMap[currentId];
        delete updateMap[currentId];
      }
    }
    for (updateId in updateMap) {
      if (updateMap.hasOwnProperty(updateId)) {
        if (updateMap[updateId].status === 'DELETED') {
          for (i = 0; i < current.length; i++) {
            if (current[i].id === updateId) {
              current.splice(i, 1);
            }
          }
        } else {
          current.push(updateMap[updateId]);
        }
      }
    }
  }

  app.service('nova', function (apiService, $q, $interval, $log) {
    var self = this;

    var fetch = function (name, url, showSpinner) {
      if (!angular.isDefined(showSpinner)) {
        showSpinner = true;
      }
      var defer = $q.defer();
      apiService.GET('nova', url, function (data) {
        defer.resolve(data[name]);
      }, {showSpinner: showSpinner});
      return defer.promise;
    };

    self.limits = function (showSpinner) {return fetch('limits', 'limits', showSpinner); };
    self.images = function (showSpinner) {return fetch('images', 'images/detail', showSpinner); };
    self.flavors = function (showSpinner) {return fetch('flavors', 'flavors/detail', showSpinner); };
    self.servers = function (showSpinner) {
      if (!angular.isDefined(showSpinner)) {
        showSpinner = true;
      }
      var defer = $q.defer();
      /*jslint unparam: true*/
      apiService.GET('nova', 'servers/detail', function (data, status, headers) {
        var obj = data.servers;
        obj.lastFetch = new Date(headers('date'));
        obj.refreshPromise = undefined;
        data.servers.startRefresh = function (period) {
          $log.debug('starting server refresh');
          obj.refreshPromise = $interval(function () {
            var url = 'servers/detail?changes-since=' + obj.lastFetch.toISOString();
            apiService.GET('nova', url, function (data, status, headers) {
              obj.lastFetch = new Date(headers('date'));
              updateArray(obj, data.servers);
            }, {showSpinner: false, onError: function () {return; }});
          }, period);
        };
        obj.stopRefresh = function () {
          $log.debug('stopping server refresh');
          if (angular.isDefined(obj.refreshPromise)) {
            $interval.cancel(obj.refreshPromise);
            obj.refreshPromise = undefined;
          }
        };
        defer.resolve(data.servers);
      }, {showSpinner: showSpinner});
      /*jslint unparam: false*/
      return defer.promise;
    };

    self.extensions = {};
    self.fetchExtensions = function () {
      // fetch the extensions
      apiService.GET('nova', 'extensions', function (data) {
        var i, extension, prop;
        // clear (don't replace; that'll confuse $digest)
        for (prop in self.extensions) {
          if (self.extensions.hasOwnProperty(prop)) {
            delete self.extensions[prop];
          }
        }
        for (i = 0; i < data.extensions.length; i++) {
          extension = data.extensions[i];
          self.extensions[extension.alias] = extension;
        }
      }, {showSpinner: false, onError: function () {return; }});
    };
  });
}());
