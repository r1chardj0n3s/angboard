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

      $scope.download = function (name) {
        var url = $scope.currentContainer + '/' + name;
//        apiService.GET(
//          'swift',
//          url,
//          function (data, status, headers) {
//            $log.info(data);
//            $log.info(status);
//            $log.info(headers())
//            $log.info('downloaded');
//          });

        $scope.downloadFile(url);
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
              apiService.HEAD('swift', data[i].name, data[i], setAccess);
              container = data[i];
              container.isPublic = false;
            }

            $scope.containers = data;
          }
        );

      };


      // From http://stackoverflow.com/questions/24080018/download-file-from-a-webapi-method-using-angularjs
      // Based on an implementation here: web.student.tuwien.ac.at/~e0427417/jsdownload.html
      $scope.downloadFile = function (httpPath) {

        var config;

        config = {
          headers: {'Accept': '*/*'},
          responseType: 'blob'
        };

        // Use an arraybuffer
        apiService.GET('swift', httpPath, function (data, status, headers, config) {

          var octetStreamMime = 'application/octet-stream';
          var success = false;
          var blob, url;

          // Get the headers
          headers = headers();

          // Get the filename from the x-filename header or default to "download.bin"
          var filename = headers['x-object-meta-orig-filename'] || 'download.bin';

          // Determine the content type from the header or default to "application/octet-stream"
          var contentType = headers['content-type'] || octetStreamMime;

          try {
            // Try using msSaveBlob if supported
            $log.info('Trying saveBlob method ...');
            /*global Blob */
            blob = new Blob([data], { type: contentType });
            if (navigator.msSaveBlob) {
              navigator.msSaveBlob(blob, filename);
            } else {
              // Try using other saveBlob implementations, if available
              var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
              if (saveBlob === undefined) {
                throw 'Not supported';
              }
              saveBlob(blob, filename);
            }
            $log.info('saveBlob succeeded');
            success = true;
          } catch (ex) {
            $log.info('saveBlob method failed with the following exception:');
            $log.info(ex);
          }

          if (!success) {
            // Get the blob url creator
            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
            if (urlCreator) {
              // Try to use a download link
              var link = document.createElement('a');
//              if ('download' in link) {
              if (link.hasOwnProperty('download')) {
                // Try to simulate a click
                try {
                  // Prepare a blob URL
                  $log.info('Trying download link method with simulated click ...');
                  blob = new Blob([data], { type: contentType });
                  url = urlCreator.createObjectURL(blob);
                  link.setAttribute('href', url);

                  // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                  link.setAttribute('download', filename);

                  // Simulate clicking the download link
                  var event = document.createEvent('MouseEvents');
                  event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                  link.dispatchEvent(event);
                  $log.info('Download link method with simulated click succeeded');
                  success = true;

                } catch (ex) {
                  $log.info('Download link method with simulated click failed with the following exception:');
                  $log.info(ex);
                }
              }

              if (!success) {
                // Fallback to window.location method
                try {
                  // Prepare a blob URL
                  // Use application/octet-stream when using window.location to force download
                  $log.info('Trying download link method with window.location ...');
                  blob = new Blob([data], { type: octetStreamMime });
                  url = urlCreator.createObjectURL(blob);
                  window.location = url;
                  $log.info('Download link method with window.location succeeded');
                  success = true;
                } catch (ex) {
                  $log.info('Download link method with window.location failed with the following exception:');
                  $log.info(ex);
                }
              }

            }
          }

          if (!success) {
            // Fallback to window.open method
            $log.info('No methods worked for saving the arraybuffer, using last resort window.open');
            window.open(httpPath, '_blank', '');
          }
        },
        config
          );
      };


      $scope.getContainers();

      /*jslint unparam: false*/
    }
    );


  ///////////////////
}());
