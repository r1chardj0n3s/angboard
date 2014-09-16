var httpTimeoutMs = 60000;

var appServices = angular.module('appServices', []);


appServices.factory('menuService', function () {
  var menuService = {};
  menuService.menus = [];
  return menuService;
});


appServices.factory('alertService', ['$rootScope', function ($rootScope) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];

  alertService.add = function (type, msg) {
    // type may be one of "danger", "success", "warning", "info"
    $rootScope.alerts[0] = {'type': type, 'msg': msg};
  };

  alertService.closeAlert = function (index) {
    $rootScope.alerts.splice(index, 1);
  };

  alertService.clearAlerts = function () {
    $rootScope.alerts.length = 0;
  };

  return alertService;
}]);


appServices.factory('apiService', [
  'alertService', '$cookieStore', '$http', '$log',
  function (alertService, $cookieStore, $http, $log) {
    var service = {};
    service.access = null;

    service.configure = function (access) {
      service.access = access;
    };

    service.authenticated = function () {
      return service.access;
    };

    // helper which displays a generic error or more specific one if we got one
    function displayError(alertService, data) {
      $log.error('Error Data:', data);
      var message = "An error has occurred (no message). Please try again.";
      try {
        if (data.hasOwnProperty('reason')) {
          message = data.reason;
        }
      } catch (e) {
        message = "An error has occurred (bad response). Please try again.";
      }
      alertService.add("danger", message);
    }

    service.ensureServiceCatalog = function () {
      if (service.access && service.access.catalog && service.access.catalog.hasOwnProperty('serviceCatalog')) {
        $log.debug('ensureServiceCatalog: got valid service.access');
        return;
      }
      $log.debug('ensureServiceCatalog: cookie:', $cookieStore.get('x-auth-token'));

      var config = {
        method: "GET",
        url: '/:service_catalog:/',
        headers : {
          'Accept': 'application/json'
        },
        timeout: httpTimeoutMs,
        cache: false
      };
      return $http(config).success(function (response, status) {
        $log.debug('ensureServiceCatalog response', status, response);
        if (status !== 200) {
          displayError(alertService, response);
        } else if (response.status === 'ok') {
          service.access = response.data;
        } else {
          $log.debug('ensureServiceCatalog: clearing access/cookie');
          var auth_token = $cookieStore.get('x-auth-token');
          if (auth_token) {
            service.access = null;
            $cookieStore.remove('x-auth-token');
          }
        }
      }).error(function (response, status) {
        $log.error('ensureServiceCatalog error', status, response);
        displayError(alertService, response);
      });
    };

    function apiCall(config, onSuccess, onError) {
      return $http(config).success(function (response, status) {
        $log.debug('apiCall success', status, response);
        try {
          onSuccess(response, status);
        } catch (e) {
          $log.error('Error handling response', e);
          displayError(alertService, response);
        }
      }).error(function (response, status) {
        $log.error('apiCall error', status, response);
        if (onError) {
          try {
            onError(response, status);
          } catch (e) {
            $log.error('Error handling error', e);
            displayError(alertService, response);
          }
        }
      });
    }

    service.GET = function (svc_name, url, onSuccess, onError) {
      return apiCall({
        method: "GET",
        url: '/' + svc_name + '/0/' + url,
        headers : {
          'Accept': 'application/json'
        },
        timeout: httpTimeoutMs,
        cache: false
      }, onSuccess, onError);
    };

    function dataCall(svc_name, method, url, data, onSuccess, onError) {
      return apiCall({
        method: method,
        url: '/' + svc_name + '/0/' + url,
        data: data,
        headers : {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: httpTimeoutMs
      }, onSuccess, onError);
    }

    service.PUT = function (svc_name, url, data, onSuccess, onError) {
      dataCall(svc_name, 'PUT', url, data, onSuccess, onError);
    };

    service.POST = function (svc_name, url, data, onSuccess, onError) {
      dataCall(svc_name, 'POST', url, data, onSuccess, onError);
    };
    return service;
  }
]);

