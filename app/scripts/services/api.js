(function () {
  'use strict';

  // automatically convert dates received from API calls into date objects
  var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

  function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== 'object') {
      return input;
    }

    var key, value, match, milliseconds;

    for (key in input) {
      if (input.hasOwnProperty(key)) {
        value = input[key];
        // Check for string properties which look like dates.
        if (typeof value !== 'string') {
          continue;
        }
        match = value.match(regexIso8601);
        if (match) {
          milliseconds = Date.parse(match[0]);
          if (!isNaN(milliseconds)) {
            input[key] = new Date(milliseconds);
          }
        } else if (typeof value === 'object') {
          // Recurse into object
          convertDateStringsToDates(value);
        }
      }
    }
  }

  /**
   * @ngdoc service
   * @name angboardApp.apiService
   * @description
   * # api
   * Service in the angboardApp.
   */
  angular.module('angboardApp')

    .config(function (localStorageServiceProvider, $httpProvider) {
      localStorageServiceProvider.setPrefix('angboard');
      $httpProvider.defaults.transformResponse.push(function (responseData) {
        convertDateStringsToDates(responseData);
        return responseData;
      });
    })

    .service('apiService',
      function (alertService, $http, $log, $location, localStorageService) {
        var self = this;
        var httpTimeoutMs = 60000;
        self.busy = 0;

        // store the entire "tokens" response from keystone
        this.access = localStorageService.get('access');

        // store just the serviceCatalog, re-jiggered to be a mapping of
        // service name to service info (TODO: deal with dupes?)
        self.services = {};

        this.setAccess = function (access) {
          $log.info('setAccess:', access);
          localStorageService.set('access', access);
          self.access = access;
          self.services = {};
          angular.forEach(access.serviceCatalog, function (service) {
            self.services[service.name] = service;
          });
        };
        this.clearAccess = function (reason) {
          $log.info('clearAccess:', reason);
          localStorageService.remove('access');
          self.access = null;
          self.services = {};
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
          if (self.access) {
            config.headers['X-Auth-Token'] = self.access.token.id;
          }
          self.busy += 1;
          return $http(config).success(function (response, status) {
            self.busy -= 1;
            $log.debug('apiCall success', status, response);
            try {
              onSuccess(response, status);
            } catch (e) {
              $log.error('Error handling response', e);
              displayError(alertService, response);
            }
          }).error(function (response, status) {
            self.busy -= 1;
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

        function simpleCall(svcName, method, url, onSuccess, onError) {
          return apiCall({
            method: method,
            url: '/api/' + svcName + '/RegionOne/' + url, // XXX REGION
            headers : {
              'Accept': 'application/json'
            },
            timeout: httpTimeoutMs,
            cache: false
          }, onSuccess, onError);
        }

        this.GET = function (svcName, url, onSuccess, onError) {
          return simpleCall(svcName, 'GET', url, onSuccess, onError);
        };

        this.DELETE = function (svcName, url, onSuccess, onError) {
          return simpleCall(svcName, 'DELETE', url, onSuccess, onError);
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

        /*jslint unparam: true*/
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
        /*jslint unparam: false*/
      });
}());
