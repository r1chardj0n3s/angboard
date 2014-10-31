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

  var CopyObjectCtrl = function ($scope, $modalInstance, $log, apiService, alertService, object,
                                 containers, currentContainer) {

      // FIXME: This won't work with pseudo folders because the proxy helpfuly decodes or urlencoding

      $log.debug('copy object details', object);
      $log.debug('currentContainer =');
      $log.debug(currentContainer);
      $scope.object = object;

      $scope.form = {
        name: object.name.split('/').pop(),
        path: object.name.split('/').slice(0, -1).join('/') + '/',
        destination: currentContainer
      };
      $scope.containers = containers;
      $scope.currentContainer = currentContainer;

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.copyObject = function () {
        var destination = encodeURIComponent($scope.form.destination) + $scope.form.path +
            encodeURIComponent($scope.form.name);

        apiService.COPY(
          'swift',
          encodeURIComponent($scope.currentContainer) + '/' + encodeURIComponent($scope.object.name),
          function () {
            alertService.add('info', 'File copied'); // FIXME: Should refresh view of container now
          },
          { headers: {'Destination': destination} }
        );

        $modalInstance.close();
      };
    };

  var ViewDetailsCtrl = function ($scope, $modalInstance, $log, containerDetails) {
    $log.debug('container view details', containerDetails);
    $scope.containerDetails = containerDetails;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var ViewObjectDetailsCtrl = function ($scope, $modalInstance, $log, object) {
    $log.debug('view object details', object);
    $scope.object = object;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  var UploadObjectCtrl = function ($scope, $modalInstance, $log, apiService, alertService,
                                   containerName, selectContainer, pseudoFolder
      ) {

      $scope.containerName = containerName;
      $scope.selectContainer = selectContainer;
      $scope.pseudoFolder = pseudoFolder;
      $scope.fileDetails = {};


      $scope.uploadObject = function () {
        var options = {
          'headers': {
            'Content-Type': $scope.fileDetails.data.type,
            'x-object-meta-original-filename': $scope.fileDetails.data.name
          }
        },
          url;

        $log.debug('upload object');

        if ($scope.objectName) {
          if ($scope.pseudoFolder) {
            url = $scope.containerName + '/' + $scope.pseudoFolder + $scope.objectName;
          } else {
            url = $scope.containerName + '/' + $scope.objectName;
          }

          apiService.PUT(
            'swift',
            url,
            $scope.fileDetails.data,
            function () {
              $scope.selectContainer($scope.containerName);
              alertService.add('info', 'File uploaded');
            },
            options
          );

          $modalInstance.close();
        } else {
          alertService('error', 'Please give the object a name before you try to upload it');
        }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

  var EditObjectCtrl = function ($scope, $modalInstance, $log, apiService, alertService,
                                 object, containerName, selectContainer) {
      $scope.object = object;
      $scope.containerName = containerName;
      $scope.selectContainer = selectContainer;


      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.save = function () {
        var options = {
          'headers': {
            'Content-Type': $scope.fileDetails.data.type,
            'x-object-meta-original-filename': $scope.fileDetails.data.name
          }
        };

        $log.debug('edit object');

        if ($scope.object.name) {
          apiService.PUT(
            'swift',
            $scope.containerName + '/' + $scope.object.name,
            $scope.fileDetails.data,
            function () {
              $scope.selectContainer($scope.containerName);
              alertService.add('info', 'File edited');
            },
            options
          );

          $modalInstance.close();
        } else {
          alertService('error', 'Please give the object a name before you try to upload it');
        }
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
      $scope.pseudoFolder = null;

      $scope.copyObject = function (object) {
        $modal.open({
          templateUrl: 'copyObject.html',
          controller: CopyObjectCtrl,
          resolve: {
            object: function () {
              return object;
            },
            containers: function () {
              return $scope.containers;
            },
            currentContainer: function () {
              return $scope.currentContainer;
            }
          },
          size: 'lg'
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

      $scope.deleteObject = function (object) {
        var deleteURL = $scope.currentContainer + '/' + object.name;
        $log.info('deleteObject called on...');
        $log.info(object);

        apiService.DELETE('swift', deleteURL, function () {
          alertService.add('info', deleteURL + ' deleted.');
          $scope.selectContainer($scope.currentContainer);
        });
      };

      $scope.download = function (name) {
        var url = $scope.currentContainer + '/' + name;

        $scope.downloadFile(url, name);
      };

      $scope.editObject = function (object) {
        $modal.open({
          templateUrl: 'editObject.html',
          controller: EditObjectCtrl,
          resolve: {
            containerName: function () {
              return $scope.currentContainer;
            },
            'object': function () {
              return object;
            },
            selectContainer: function () {
              return $scope.selectContainer;
            }
          }
        });
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
        $scope.pseudoFolder = null;


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

      $scope.selectPseudoFolder = function (name) {
        $scope.pseudoFolder = name;
        $log.info(name);

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
          $scope.currentContainer + '/?prefix=' + name + '&delimiter=/',
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

      $scope.uploadObject = function () {
        $modal.open({
          templateUrl: 'uploadObject.html',
          controller: UploadObjectCtrl,
          resolve: {
            containerName: function () {
              return $scope.currentContainer;
            },
            pseudoFolder: function () {
              return $scope.pseudoFolder;
            },
            selectContainer: function () {
              return $scope.selectContainer;
            }
          }
        });
      };

      $scope.viewObject = function (object) {
        var url = $scope.currentContainer + '/' + object.name;

        apiService.GET(
          'swift',
          url,
          function (response, status, headers) {
            /*jslint unparam: true */
            object.lastModified = headers('last-modified');
            object.hash = headers('etag');
            object.type = headers('content-type');
          },
          null
        );

        $modal.open({
          templateUrl: 'viewObjectDetails.html',
          controller: ViewObjectDetailsCtrl,
          resolve: {
            object: function () {
              return object;
            }
          }
        });
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

          // Get the filename from the config url or default to "download.bin"
          var filename = config.url.split('/').pop();

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


}());
