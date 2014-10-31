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
      function (alertService, $http, $log, $location, localStorageService,
          $cookieStore) {
        var self = this;
        var httpTimeoutMs = 60000;
        self.busy = {count: 0};

        // store the entire "tokens" response from keystone
        self.access = localStorageService.get('access');

        // store just the serviceCatalog, re-jiggered to be a mapping of
        // service name to service info (TODO: deal with dupes?)
        function populateServices() {
          self.services = {};
          if (!self.access) {
            return;
          }
          angular.forEach(self.access.serviceCatalog, function (service) {
            self.services[service.name] = service;
          });
        }
        populateServices();

        this.setAccess = function (access) {
          $log.info('setAccess:', access);
          localStorageService.set('access', access);
          self.access = access;
          populateServices();
        };
        this.clearAccess = function (reason) {
          $log.info('clearAccess:', reason);
          $cookieStore.remove('x-auth-token');
          localStorageService.remove('access');
          self.access = null;
          self.services = {};
        };

        // helper which displays a generic error or more specific one if we got one
        function displayError(alertService, data, message) {
          $log.debug('Error Data:', data);
          try {
            if (data.hasOwnProperty('reason')) {
              $log.debug('displayError using data.reason');
              message = data.reason;
            } else if (data.hasOwnProperty('error')) {
              $log.debug('displayError using data.error.message');
              message = data.error.message;
            } else if (data.hasOwnProperty('computeFault')) {
              $log.debug('displayError using data.computeFault.message');
              message = data.computeFault.message;
            } else if (data.hasOwnProperty('badRequest')) {
              $log.debug('displayError using data.badRequest.message');
              message = data.badRequest.message;
            }
          } catch (e) {
            message = undefined;
          }
          if (!angular.isDefined(message)) {
            message = 'An error has occurred (bad response). Please try again.';
          }
          alertService.add('warning', message);
        }

        function suppliedOption(options, key) {
          if (!angular.isObject(options)) {
            return false;
          }
          return options.hasOwnProperty(key);
        }

        function apiCall(config, onSuccess, options) {
          // grab a handle on this so an in-flight call doesn't
          // screw up at force-reset new counter
          var busy = self.busy;
          var showSpinner = true;
          if (suppliedOption(options, 'showSpinner')) {
            showSpinner = options.showSpinner;
          }
          if (showSpinner) {
            busy.count += 1;
            $log.debug('busy += 1 ->', self.busy);
          }

          if (angular.isObject(options) && options.hasOwnProperty('responseType')) {
            config.responseType = options.responseType;
          }

          $log.debug('API call', config.method, config.url);
          return $http(config).success(function (response, status, headers, config) {
            if (showSpinner) {
              busy.count -= 1;
              $log.debug('busy -= 1 ->', self.busy);
            }
            $log.debug('apiCall success', status);
            try {
              onSuccess(response, status, headers, config);
            } catch (e) {
              $log.error('Error handling response', e);
              displayError(alertService, response);
            }
          }).error(function (response, status, headers) {
            if (showSpinner) {
              busy.count -= 1;
              $log.debug('busy -= 1 ->', self.busy);
            }
            if (status === 401) {
              $log.warn('apiCall 401 response handler', response);
              // Authentication credentials (either username/password or
              // token) rejected by backend
              displayError(alertService, response, 'Authentication required.');
              self.clearAccess('got an API/proxy 401');
              $location.path('/keystone/login');
              return;
            }

            $log.error('apiCall error', status, response);
            if (suppliedOption(options, 'onError')) {
              try {
                options.onError(response, status, headers);
              } catch (e) {
                $log.error('Error handling error', e);
                displayError(alertService, response, 'An error occurred.');
              }
            } else {
              displayError(alertService, response, 'An error occurred.');
            }
          });
        }

        function simpleCall(svcName, method, url, onSuccess, options) {
          var headers = {};
          if (suppliedOption(options, 'headers')) {
            headers = angular.copy(options.headers);
          }

          if (!headers.hasOwnProperty('Accept')) {
            headers.Accept = 'application/json';
          }

          return apiCall({
            method: method,
            url: '/api/' + svcName + '/RegionOne/' + url, // XXX REGION
            headers : headers,
            timeout: httpTimeoutMs,
            cache: false
          }, onSuccess, options);
        }

        this.GET = function (svcName, url, onSuccess, options) {
          return simpleCall(svcName, 'GET', url, onSuccess, options);
        };

        this.COPY = function (svcName, url, onSuccess, options) {
          return simpleCall(svcName, 'COPY', url, onSuccess, options);
        };

        this.DELETE = function (svcName, url, onSuccess, options) {
          return simpleCall(svcName, 'DELETE', url, onSuccess, options);
        };

        function dataCall(svcName, method, url, data, onSuccess, options) {
          var headers = {};
          if (suppliedOption(options, 'headers')) {
            headers = angular.copy(options.headers);
          }
          headers.Accept = 'application/json';

          if (!headers.hasOwnProperty('Content-Type')) {
            headers['Content-Type'] = 'application/json';
          }

          $log.info('data call', data);
          return apiCall({
            method: method,
            url: '/api/' + svcName + '/RegionOne/' + url,   // XXX REGION
            data: data,
            headers : headers,
            timeout: httpTimeoutMs
          }, onSuccess, options);
        }

        this.HEAD = function (svcName, url, data, onSuccess, options) {
          return dataCall(svcName, 'HEAD', url, data, onSuccess, options);
        };

        this.PUT = function (svcName, url, data, onSuccess, options) {
          dataCall(svcName, 'PUT', url, data, onSuccess, options);
        };

        this.POST = function (svcName, url, data, onSuccess, options) {
          dataCall(svcName, 'POST', url, data, onSuccess, options);
        };
      });
}());
