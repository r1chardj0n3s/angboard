var httpTimeoutMs = 60000;

var appServices = angular.module('appServices', ['LocalStorageModule']);


appServices.config([
  'localStorageServiceProvider',
  function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('angboard');
  }
]);


appServices.factory('menuService', function () {
  var menuService = {};
  menuService.menus = [];
  menuService.visible = true;

  menuService.list = function () {
    if (menuService.visible) {
      return menuService.menus;
    }
    return [];
  };

  menuService.shouldShow = function (menu) {
    if (menu.hasOwnProperty('show')) {
      return menu.show();
    }
    return true;
  };

  return menuService;
});


appServices.factory('alertService', ['$rootScope', function ($rootScope) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];

  alertService.add = function (type, msg) {
    // type may be one of "error", "success", "warning", "info"
    $rootScope.alerts.push({'type': type, 'msg': msg});
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
  'alertService', '$http', '$log', '$location', 'localStorageService',
  function (alertService, $http, $log, $location, localStorageService) {
    var service = {};

    service.setAccess = function (access) {
      $log.info('setAccess:', access);
      localStorageService.set('access', angular.toJson(access));
      service.is_authenticated = true;
    };
    service.clearAccess = function (reason) {
      $log.info('clearAccess:', reason);
      localStorageService.remove('access');
      service.is_authenticated = false;
    };

    service.access = function () {
      var access = localStorageService.get('access');
      if (access) {
        return angular.fromJson(access);
      }
      return null;
    };

    service.is_authenticated = !!service.access();

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
      alertService.add("error", message);
    }

    function apiCall(config, onSuccess, onError) {
      if (service.is_authenticated) {
        config.headers['X-Auth-Token'] = service.access().token.id;
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
        $log.error('apiCall error', status, response);
        if (status === 401) {
          // backend has indicated authentication required which means our
          // access token is no longer valid
          alertService.add("error", 'Authentication required');
          service.clearAccess('got an API/proxy 401');
          $location.path('/keystone/login');
        }
        if (onError) {
          try {
            onError(response, status);
          } catch (e) {
            $log.error('Error handling error', e);
            displayError(alertService, response);
          }
        } else {
          alertService.add("error", 'An error occurred.');
        }
      });
    }

    service.GET = function (svc_name, url, onSuccess, onError) {
      return apiCall({
        method: "GET",
        url: '/' + svc_name + '/RegionOne/' + url, // XXX REGION
        headers : {
          'Accept': 'application/json'
        },
        timeout: httpTimeoutMs,
        cache: false
      }, onSuccess, onError);
    };

    function dataCall(svc_name, method, url, data, onSuccess, onError) {
      $log.info('data call', data);
      return apiCall({
        method: method,
        url: '/' + svc_name + '/RegionOne/' + url,   // XXX REGION
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

