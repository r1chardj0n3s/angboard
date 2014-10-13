(function () {
  'use strict';

  var ModalCtrl = function ($scope, $modalInstance, data) {
    $scope.data = data;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };


  var app = angular.module('angboardApp');


  app.config(function ($routeProvider) {
    $routeProvider.when('/nova/images', {
      templateUrl: 'views/nova_images.html'
    });
    $routeProvider.when('/nova/flavors', {
      templateUrl: 'views/nova_flavors.html'
    });
    $routeProvider.when('/nova/servers', {
      templateUrl: 'views/nova_servers.html'
    });
    $routeProvider.when('/nova/networks', {
      templateUrl: 'views/nova_networks.html'
    });
  });


  app.value('novaExtensions', {});


  app.run(function (menuService, apiService, novaExtensions) {
    // fetch the extensions
    apiService.GET('nova', 'extensions', function (data) {
      var i, extension, prop;
      for (prop in novaExtensions) {
        if (novaExtensions.hasOwnProperty(prop)) {
          delete novaExtensions[prop];
        }
      }
      for (i = 0; i < data.extensions.length; i++) {
        extension = data.extensions[i];
        novaExtensions[extension.alias] = extension;
      }
    });

    var menu = {'title': 'Compute', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Images', 'action': '#/nova/images'});
    menu.menus.push({'title': 'Flavors', 'action': '#/nova/flavors'});
    menu.menus.push({'title': 'Servers', 'action': '#/nova/servers'});
    menu.menus.push({
      'title': 'Networks',
      'action': '#/nova/networks',
      'show': function () {
        return novaExtensions.hasOwnProperty('os-networks');
      }
    });
    menuService.push(menu);
  });


  app.controller('ImagesCtrl', function ($scope, apiService, alertService, imageModal) {
    $scope.$root.pageHeading = 'Images';
    alertService.clearAlerts();

    apiService.GET('nova', 'images/detail', function (data) {
      $scope.images = data.images;
    });

    $scope.imageInfo = function (image) {
      alertService.clearAlerts();
      imageModal.open(image.id);
    };
  });


  app.controller('FlavorsCtrl', function ($scope, apiService, alertService, flavorModal) {
    $scope.$root.pageHeading = 'Flavors';
    alertService.clearAlerts();

    apiService.GET('nova', 'flavors/detail', function (data) {
      $scope.flavors = data.flavors;
    });

    $scope.flavorInfo = function (flavor) {
      alertService.clearAlerts();
      flavorModal.open(flavor.id);
    };
  });


  function updateArray(current, updates) {
    var i, updateMap = {}, currentId, updateId;
    angular.forEach(updates, function (update) {
      updateMap[update.id] = update;
    });
    for (i = 0; i < current.length; i++) {
      currentId = current[i].id;
      if (updateMap.hasOwnProperty(currentId) && updateMap[currentId].status !== 'DELETED') {
        current[i] = updateMap[currentId];
        delete updateMap[currentId];
      }
    }
    for (updateId in updateMap) {
      if (updateMap.hasOwnProperty(updateId)) {
        if (updateMap[updateId].status === 'DELETED') {
          for (i = 0; i < current.length; i++) {
            if (current[i].id === updateId) {
              current.splice(i, 1);
            }
          }
        } else {
          current.push(updateMap[updateId]);
        }
      }
    }
  }

  app.controller('ServersCtrl', function ($scope, apiService, alertService,
      $log, $interval, $modal, serverModal, imageModal, flavorModal) {
    var self = this;
    $scope.$root.pageHeading = 'Servers';
    alertService.clearAlerts();

    apiService.GET('nova', 'flavors/detail', function (data) {
      $scope.flavors = data.flavors;
      $scope.flavorMap = {};
      angular.forEach(data.flavors, function (flavor) {
        $scope.flavorMap[flavor.id] = flavor;
      });
    });
    apiService.GET('nova', 'images/detail', function (data) {
      $scope.images = data.images;
      $scope.imageMap = {};
      angular.forEach(data.images, function (image) {
        $scope.imageMap[image.id] = image;
      });
    });

    var refreshServers = function () {
      var url, update = angular.isDefined(self.lastFetch);
      if (update) {
        url = 'servers/detail?changes-since=' + self.lastFetch.toISOString();
        $log.debug('refresh servers', url);
      } else {
        url = 'servers/detail';
        $log.debug('fetch servers', url);
      }
      /*jslint unparam: true*/
      apiService.GET('nova', url, function (data, status, headers) {
        self.lastFetch = new Date(headers('date'));
        $log.debug('response date', headers('date'),
          self.lastFetch.toISOString());
        if (update) {
          updateArray($scope.servers, data.servers);
        } else {
          // first fetch
          $scope.servers = data.servers;
        }
      }, null, false);
      /*jslint unparam: false*/
    };

    var refreshPromise = $interval(refreshServers, 1000);

    // Cancel interval on page changes
    $scope.$on('$destroy', function () {
      if (angular.isDefined(refreshPromise)) {
        $interval.cancel(refreshPromise);
        refreshPromise = undefined;
      }
    });


    $scope.showFault = function (server) {
      $modal.open({
        templateUrl: 'showFault.html',
        controller: ModalCtrl,
        size: 'lg',
        resolve: {data: function () {return server; }}
      });
    };

    // somewhere to store the new server stuffs
    $scope.newServer = {};
    $scope.createServer = function () {
      $log.debug('creating a server with', $scope.newServer);
      alertService.clearAlerts();

      apiService.POST(
        'nova',
        'servers',
        {'server': $scope.newServer},
        function (data, status) {
          $scope.newServer = {};
          if (status === 202) {
            $modal.open({
              templateUrl: 'createResponse.html',
              controller: ModalCtrl,
              resolve: {data: function () {return data; }}
            });
          } else {
            alertService.add('error', 'Server add failed!');
          }
        },
        function (data) {
          $scope.newServer = {};
          alertService.add('error', 'Server add failed: ' +
                           data.computeFault.message);
        }
      );
    };

    $scope.deleteServer = function (server) {
      $log.debug('deleting server', server);
      alertService.clearAlerts();

      /*jslint unparam: true*/
      apiService.DELETE(
        'nova',
        'servers/' + server.id,
        function (data, status) {
          if (status === 204) {
            alertService.add('info', 'Server deleted! ');
          } else {
            alertService.add('error', 'Server delete failed! ');
          }
        },
        function (data) {
          alertService.add('error', 'Server delete failed ' + data);
        }
      );
      /*jslint unparam: false*/
    };

    $scope.serverInfo = function (server) {
      $log.debug('fetch server info for', server);
      alertService.clearAlerts();
      serverModal.open(server.id);
    };

    $scope.imageInfo = function (image) {
      $log.debug('fetch image info for', image);
      alertService.clearAlerts();
      imageModal.open(image.id);
    };

    $scope.flavorInfo = function (flavor) {
      $log.debug('fetch flavor info for', flavor);
      alertService.clearAlerts();
      flavorModal.open(flavor.id);
    };
  });


  app.service('serverModal', function (apiService, $modal) {
    this.open = function (serverId) {
      apiService.GET('nova', 'servers/' + serverId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_server_detail.html',
            controller: ModalCtrl,
            size: 'lg',
            resolve: {data: function () {return data.server; }}
          });
        });
    };
  });


  app.controller('NetworksCtrl', function ($log, $scope, apiService, alertService, networkModal) {
    $scope.$root.pageHeading = 'Networks';
    alertService.clearAlerts();

    apiService.GET('nova', 'os-networks', function (data) {
      $scope.networks = data.networks;
    });

    $scope.networkDetail = function (network) {
      $log.debug('fetch network info for', network);
      alertService.clearAlerts();
      networkModal.open(network.id);
    };
  });


  app.service('imageModal', function (apiService, $modal) {
    this.open = function (imageId) {
      apiService.GET('nova', 'images/' + imageId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_image_detail.html',
            controller: ModalCtrl,
            size: 'lg',
            resolve: {data: function () {return data.image; }}
          });
        });
    };
  });


  app.service('flavorModal', function (apiService, $modal) {
    this.open = function (flavorId) {
      apiService.GET('nova', 'flavors/' + flavorId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_flavor_detail.html',
            controller: ModalCtrl,
            size: 'lg',
            resolve: {data: function () {return data.flavor; }}
          });
        });
    };
  });


  app.service('networkModal', function (apiService, $modal) {
    this.open = function (networkId) {
      apiService.GET('nova', 'os-networks/' + networkId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_network_detail.html',
            controller: ModalCtrl,
            size: 'lg',
            resolve: {data: function () {return data.network; }}
          });
        });
    };
  });
}());