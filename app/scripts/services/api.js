'use strict';

/**
 * @ngdoc service
 * @name angboardApp.apiService
 * @description
 * # api
 * Service in the angboardApp.
 */
angular.module('angboardApp')

  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('angboard');
  })

  .service('apiService',
    function (alertService, $http, $log, $location, localStorageService) {
      var self = this;
      var httpTimeoutMs = 60000;

      this.access = function () {
        var access = localStorageService.get('access');
        if (access) {
          return angular.fromJson(access);
        }
        return null;
      };

      self.isAuthenticated = !!this.access();

      this.setAccess = function (access) {
        $log.info('setAccess:', access);
        localStorageService.set('access', angular.toJson(access));
        self.isAuthenticated = true;
      };
      this.clearAccess = function (reason) {
        $log.info('clearAccess:', reason);
        localStorageService.remove('access');
        self.isAuthenticated = false;
      };

      // helper which displays a generic error or more specific one if we got one
      function displayError(alertService, data) {
        $log.error('Error Data:', data);
        var message = 'An error has occurred (no message). Please try again.';
        try {
          if (data.hasOwnProperty('reason')) {
            message = data.reason;
          }
        } catch (e) {
          message = 'An error has occurred (bad response). Please try again.';
        }
        alertService.add('error', message);
      }

      function apiCall(config, onSuccess, onError) {
        if (self.isAuthenticated) {
          config.headers['X-Auth-Token'] = self.access().token.id;
        }
        return $http(config).success(function (response, status) {
          $log.debug('apiCall success', status, response);
          try {
            onSuccess(response, status);
          } catch (e) {
            $log.error('Error handling response', e);
            displayError(alertService, response);
          }
        }).error(function (response, status) {
          if (status === 401) {
            $log.warn('apiCall authentication rejected', status, response);
            // backend has indicated authentication required which means our
            // access token is no longer valid
            alertService.add('error', 'Authentication required');
            self.clearAccess('got an API/proxy 401');
            $location.path('/keystone/login');
          } else {
            $log.error('apiCall error', status, response);
          }
          if (onError) {
            try {
              onError(response, status);
            } catch (e) {
              $log.error('Error handling error', e);
              displayError(alertService, response);
            }
          } else {
            alertService.add('error', 'An error occurred.');
          }
        });
      }

      this.GET = function (svcName, url, onSuccess, onError) {
        return apiCall({
          method: 'GET',
          url: '/api/' + svcName + '/RegionOne/' + url, // XXX REGION
          headers : {
            'Accept': 'application/json'
          },
          timeout: httpTimeoutMs,
          cache: false
        }, onSuccess, onError);
      };

      function dataCall(svcName, method, url, data, onSuccess, onError) {
        $log.info('data call', data);
        return apiCall({
          method: method,
          url: '/api/' + svcName + '/RegionOne/' + url,   // XXX REGION
          data: data,
          headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: httpTimeoutMs
        }, onSuccess, onError);
      }

      this.PUT = function (svcName, url, data, onSuccess, onError) {
        dataCall(svcName, 'PUT', url, data, onSuccess, onError);
      };

      this.POST = function (svcName, url, data, onSuccess, onError) {
        dataCall(svcName, 'POST', url, data, onSuccess, onError);
      };

      this.HEAD = function (svcName, url, data, onSuccess, onError) {
        return apiCall({
          method: 'HEAD',
          url: '/api/' + svcName + '/RegionOne/' + url, // XXX REGION
          headers : {
            'Accept': 'application/json'
          },
          timeout: httpTimeoutMs,
          cache: false
        }, onSuccess, onError);
      };
    });
