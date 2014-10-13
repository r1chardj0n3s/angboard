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


  app.controller('SwiftContainersCtrl',
    function ($scope, apiService, alertService, $modal, $log) {
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

      $scope.selectContainer = function (name) {
        $scope.currentContainer = name;
        apiService.GET(
          'swift',
          name + '?delimiter=/',
          function (data) {
            var i = 0,
              objects = [];

            $log.info(data);

            // Loop through listing looking for subfolders
            for (i = 0; i < data.length; i++) {
              if (data[i].hasOwnProperty('subdir')) {
                objects.push(
                  {
                    'name': data[i].subdir,
                    'type':'pseudo folder'
                  }
                );
              }
            }

            // Add the objects after the subfolders
            for (i = 0; i < data.length; i++) {
              if (!data[i].hasOwnProperty('subdir')) {
                objects.push(
                  {
                    'name': data[i].name,
                    'bytes':data[i].bytes,
                    'type':'object'
                  }
                );
              }
            }

            $scope.objects = objects;
          }
        );
      };

      /*jslint unparam: true*/
      apiService.GET(
        'swift',
        '',
        function (data) {
          var i,
            container;

          function setAccess(data, status, headers, config) {
            // FIXME: This is a bit of a hack. It seems the only way to pass the container to this function
            // is via the config object.
            var object = config.data;

            if (headers('x-container-read') === '.r:*,.rlistings') {
              object.isPublic = true;
            }
          }

          for (i = 0; i < data.length; i++) {
            apiService.HEAD(
              'swift',
              data[i].name,
              data[i],
              setAccess
            );
            container = data[i];
            container.isPublic = false;
          }

          $scope.containers = data;
        }
      );
      /*jslint unparam: false*/
    }
    );
}());
