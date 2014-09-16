var httpTimeoutMs = 60000;

var appServices = angular.module('appServices', []);

appServices.factory('alertService', function ($rootScope) {
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
});


appServices.factory('apiService', [
  'alertService', '$cookieStore', '$http', '$location', '$log',
  function (alertService, $cookieStore, $http, $location, $log) {
    var service = {};
    service.catalog = null;

    service.configure = function (catalog) {
      service.catalog = catalog;
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
      if (service.catalog && service.catalog.hasOwnProperty('serviceCatalog')) {
        return;
      }
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
        if (status !== 200) {
          displayError(alertService, response);
        } else if (response.status === 'ok') {
          service.catalog = response.data;
        } else {
          var auth_token = $cookieStore.get('x-auth-token');
          if (auth_token) {
            service.catalog = null;
            $cookieStore.remove('x-auth-token');
          }
        }
      }).error(function (data) {
        displayError(alertService, data);
      });
    };

    function apiCall(config, onSuccess, onError) {
      return $http(config).success(function (response, status) {
        if (status >= 400) {
          // 4xx, 5xx responses indicate errors, yes
          displayError(alertService, response);
        } else {
          try {
            onSuccess(response, status);
          } catch (e) {
            $log.error('Error handling', onSuccess, response, e)
            displayError(alertService, response);
          }
        }
      }).error(function (response, status) {
        if (onError) {
          try {
            onError(response, status);
          } catch (e) {
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

