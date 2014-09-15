/*jslint plusplus: true */
/*global angular */
'use strict';

var app = angular.module('angboardApp');

app.config(function ($routeProvider) {
  $routeProvider.when('/swift', {
    templateUrl: 'views/swift.html'
  });
});


app.run(function (menuService) {
  var menu = {'title': 'Swift', 'action': '#', 'menus': []};

  menu.menus.push({'title': 'Swift', 'action': '#/swift'});
  menuService.menus.push(menu);
});


// Stolen from
function humanFileSize(bytes, si) {
  // Note does not cope with -ve bytes
  var thresh = si ? 1000 : 1024,
    units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'],
    u = -1;

  if (bytes < thresh) {
    return bytes + ' B';
  }

  do {
    bytes /= thresh;
    u = u + 1;
  } while (bytes >= thresh);
  return bytes.toFixed(1)  +  ' '  +  units[u];
}

var ViewDetailsCtrl = function ($scope, $modalInstance, $log, containerDetails) {

  $log.info(containerDetails);
  $scope.containerDetails = containerDetails;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

app.controller('SwiftContainersCtrl', [
  '$scope', 'apiService', 'alertService', '$modal', '$log',
  function ($scope, apiService, alertService, $modal, $log) {
    $scope.$root.pageHeading = 'Containers';
    alertService.clearAlerts();

    $scope.apiService = apiService;

    $scope.open = function (containerDetails) {

      $modal.open({
        templateUrl: 'viewDetails.html',
        controller: ViewDetailsCtrl,
        resolve: {
          containerDetails: function () {
            return containerDetails;
          }
        }
      });
    };

    apiService.GET(
      'swift',
      '',
      function (data, status, headers) {
        var access = 'Private',  // FIXME
          i,
          container,
          size;

        if (data) {
          $log.info(data);
        }

        if (headers) {
          $log.info(headers());
        }

        function logContainerHeaders(containerData, containerStatus, containerHeaders) {
          if (containerHeaders) {
            $log.debug(containerStatus);
            $log.debug(containerHeaders());
            $log.debug(containerData);
          }
        }

        for (i = 0; i < data.length; i++) {
          apiService.HEAD(
            'swift',
            data[i].name,
            null,
            logContainerHeaders
          );

          container = data[i];
          size = humanFileSize(container.bytes);

          container.size = size;
          container.access = access;
        }

        $scope.containers = data;
      }
    );
  }
]);

