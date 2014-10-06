/*jslint plusplus: true */
/*global angular */
(function () {
  'use strict';

  var app = angular.module('angboardApp');

  app.config(function ($routeProvider) {
    $routeProvider.when('/swift', {
      templateUrl: 'views/swift.html'
    });
  });


  app.run(function (menuService, apiService) {
    var menu = {
      'title': 'Swift',
      'action': '#',
      'menus': [],
      'show': function () {
        return apiService.services.hasOwnProperty('swift');
      }
    };

    menu.menus.push({'title': 'Swift', 'action': '#/swift'});
    menuService.push(menu);
  });


  var ViewDetailsCtrl = function ($scope, $modalInstance, $log, containerDetails) {
    $log.debug('container view details', containerDetails);
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

      /*jslint unparam: true*/
      apiService.GET(
        'swift',
        '',
        function (data, status, headers) {
          var access = 'Private',  // FIXME
            i,
            container;

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
            container.access = access;
          }

          $scope.containers = data;
        }
      );
      /*jslint unparam: false*/
    }
  ]);
}());
