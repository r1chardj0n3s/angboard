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
    '$scope', 'apiService', 'alertService', '$modal', '$log', 'humanFileSizeFilter',
    function ($scope, apiService, alertService, $modal, $log, humanFileSizeFilter) {
      $scope.$root.pageHeading = 'Containers';
      alertService.clearAlerts();

      $scope.apiService = apiService;
      $scope.currentContainer = null;

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

      $scope.selectContainer = function(name) {
        $scope.currentContainer = name;
        apiService.GET(
          'swift',
          name,
          function(data) {
            $scope.objects = data;
          }
        );
      };

      $scope.setContainerDetails = function(container, url) {
        var details;

        if (container.isPublic) {
          container.access = '<a href="' + url + '">Public</a>';
        }
        else {
          container.access = 'Private';
        }

        details = 'Object Count: ' + container.count + '<br/>' +
          'Size: ' + humanFileSizeFilter(container.bytes) + '<br/>' +
          'Access: ' + container.access;

        container.details = details;

      }

      /*jslint unparam: true*/
      apiService.GET(
        'swift',
        '',
        function (data, status, headers) {
          var access = 'Private',  // FIXME
            i,
            container;

          function setAccess(data, status, headers, config) {
            // FIXME: This is a bit of a hack. Discuss with Richard
            // to see if he has a better idea as to how pass the container
            // into this function (i.e. not via the config object)
            var i = config.data,
              container,
              details;

            container = $scope.containers[i];

            if (headers('x-container-read') === '.r:*,.rlistings') {
              container.isPublic = true;
              }

            $scope.setContainerDetails(container, config.url);
          }

          for (i = 0; i < data.length; i++) {
            apiService.HEAD(
              'swift',
              data[i].name,
              i,
              setAccess
            );
            container = data[i];
            container.isPublic = false;
            $scope.setContainerDetails(container, '');
          }

          $scope.containers = data;
        }
      );
      /*jslint unparam: false*/
    }
  ]);
}());
