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

  var UploadObjectCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var CreateContainerCtrl = function ($scope, $modalInstance, $log, apiService, getContainers) {
    $log.debug('create container');
    $scope.name = '';

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.create = function () {
      $log.info($scope.name);
      $log.info($scope.access);

      apiService.PUT(
        'swift',
        $scope.name,
        null,
        function (data) {
          $log.info('container created - update table?');
          $log.info(data);
        }
      );

      getContainers();
      $modalInstance.close();
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

      $scope.createContainer = function () {
        $modal.open({
          templateUrl: 'createContainer.html',
          controller: CreateContainerCtrl,
          resolve: {
            getContainers: function () {
              return $scope.getContainers;
            }
          }
        });
      };

      $scope.deleteContainer = function (container) {
        $log.info('Delete container called on', container);

        apiService.DELETE(
          'swift',
          container.name,
          function () {
            $log.info('Container successfully deleted');
            $scope.getContainers();
          },
          {onError: function () {
            var message = 'Could not delete container ' + container.name + ' - is it empty?';
            $log.info(message);
            alertService.add('warning', message);
          }}
        );
      };

      $scope.makePrivate = function (container) {
        $log.info('makePrivate called on');
        $log.info(container);
        apiService.POST(
          'swift',
          container.name,
          null,
          function () {
            $log.info('container now private');
            $scope.getContainers();
          },
          {headers: {'X-Container-Read': ''}}
        );
      };

      $scope.makePublic = function (container) {
        $log.info('makePublic called on');
        $log.info(container);
        apiService.POST(
          'swift',
          container.name,
          null,
          function () {
            $log.info('container now public');
            $scope.getContainers();
          },
          {headers: {'X-Container-Read': '.r:*,.rlistings'}}
        );
      };

      $scope.uploadObject = function () {
        $modal.open({
          templateUrl: 'uploadObject.html',
          controller: UploadObjectCtrl
        });
      };

      $scope.selectContainer = function (name) {
        $scope.currentContainer = name;

        function SwiftObject(object) {
          var isFolder = object.hasOwnProperty('subdir');

          if (isFolder) {
            this.name = object.subdir;
          } else {
            this.name = object.name;
            this.bytes = object.bytes;
          }

          this.isFolder = isFolder;
        }

        apiService.GET(
          'swift',
          name + '?delimiter=/',
          function (data) {
            var i = 0,
              object,
              folders = [],
              files = [];

            // To mimic horizon we want to return a list of object with the pseudo-folders
            // first followed by the files.
            // First we need to classify the objects returned by swift as either folders or
            // files.
            for (i = 0; i < data.length; i++) {
              object = new SwiftObject(data[i]);

              if (object.isFolder) {
                folders.push(object);
              } else {
                files.push(object);
              }
            }

            // Add the files after the subfolders
            $scope.objects = folders.concat(files);
          }
        );
      };

      /*jslint unparam: true*/
      $scope.getContainers = function () {
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

              if (headers('X-Container-Read') === '.r:*,.rlistings') {

                object.isPublic = true;
              }
            }

            for (i = 0; i < data.length; i++) {
              apiService.HEAD('swift', data[i].name, setAccess);
              container = data[i];
              container.isPublic = false;
            }

            $scope.containers = data;
          }
        );

      };
      $scope.getContainers();

      /*jslint unparam: false*/
    }
    );
}());
