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
  'alertService', '$http',
  function (alertService, $http) {
    var service = {};
    service.catalog = null;

    // helper which displays a generic error or more specific one if we got one
    function displayError(alertService, data) {
      var message = "An error has occurred (no message). Please try again.";
      try {
        if (data.hasOwnProperty('error')) {
          message = data.error.message;
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
      return $http(config).success(function (data, status) {
        service.catalog = data;
      }).error(function (data) {
        displayError(alertService, data);
      });
    };

    service.GET = function (svc_name, url, onSuccess) {
      var config = {
        method: "GET",
        url: '/' + svc_name + '/0/' + url,
        headers : {
          'Accept': 'application/json'
        },
        timeout: httpTimeoutMs,
        cache: false
      };
      return $http(config).success(function (data, status) {
        return onSuccess(data, status);
      }).error(function (data) {
        displayError(alertService, data);
      });
    };

    function dataCall(svc_name, method, url, data, onSuccess, onError) {
      var config = {
        method: method,
        url: '/' + svc_name + '/0/' + url,
        data: data,
        headers : {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: httpTimeoutMs
      };
      $http(config).success(function (data, status) {
        try {
          onSuccess(data, status);
        } catch (e) {
          displayError(alertService, data);
        }
      }).error(function (data, status) {
        if (onError) {
          try {
            onError(data, status);
          } catch (e) {
            displayError(alertService, data);
          }
        }

      });
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

