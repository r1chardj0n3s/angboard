/*global _*/
(function () {
  'use strict';

  var app = angular.module('angboardApp');


  app.run(function ($rootScope, menuService, apiService, nova) {
    if (_.isEmpty(nova.extensions) && apiService.access) {
      nova.fetchExtensions();
    }
    $rootScope.$on('login', nova.fetchExtensions);

    var menu = {'title': 'Compute', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Images', 'action': '#/nova/images'});
    menu.menus.push({'title': 'Flavors', 'action': '#/nova/flavors'});
    menu.menus.push({'title': 'Servers', 'action': '#/nova/servers'});
    menu.menus.push({'title': 'Extensions', 'action': '#/nova/extensions'});
    menu.menus.push({
      title: 'Networks',
      action: '#/nova/networks',
      show: function () {
        return nova.extensions.hasOwnProperty('os-networks');
      }
    });
    menuService.push(menu);
  });


  // hook fetching this data into the route resolution so it's loaded before
  // we switch route to the new page; also allows nicer sharing of the fetch
  // functionality between uses
  app.config(function ($routeProvider) {
    $routeProvider.when('/nova/images', {
      controller: 'NovaImagesCtrl',
      templateUrl: 'views/nova_images.html',
      resolve: {
        images: function (nova) {return nova.images(false); }
      }
    });
    $routeProvider.when('/nova/flavors', {
      controller: 'NovaFlavorsCtrl',
      templateUrl: 'views/nova_flavors.html',
      resolve: {
        flavors: function (nova) {return nova.flavors(false); }
      }
    });
    $routeProvider.when('/nova/servers', {
      controller: 'NovaServersCtrl',
      templateUrl: 'views/nova_servers.html',
      resolve: {
        images: function (nova) {return nova.images(false); },
        flavors: function (nova) {return nova.flavors(false); },
        servers: function (nova) {return nova.servers(false); }
      }
    });
    $routeProvider.when('/nova/networks', {
      controller: 'NovaNetworksCtrl',
      templateUrl: 'views/nova_networks.html'
    });
    $routeProvider.when('/nova/extensions', {
      controller: 'NovaExtensionsCtrl',
      template: '<pre>{{extensions|json}}</pre>',
      resolve: {
        images: function (nova) {return nova.extensions; }
      }
    });
  });


  app.controller('NovaImagesCtrl', function ($scope, images, alertService,
      novaImageModal) {
    $scope.$root.pageHeading = 'Images';
    alertService.clearAlerts();
    $scope.images = images;

    $scope.imageDetail = function (image) {
      alertService.clearAlerts();
      novaImageModal.open(image.id);
    };
  });


  app.controller('NovaFlavorsCtrl', function ($scope, flavors, alertService,
      novaFlavorModal) {
    $scope.$root.pageHeading = 'Flavors';
    alertService.clearAlerts();
    $scope.flavors = flavors;

    $scope.flavorDetail = function (flavor) {
      alertService.clearAlerts();
      novaFlavorModal.open(flavor.id);
    };
  });


  app.controller('NovaExtensionsCtrl', function ($scope, nova) {
    $scope.extensions = nova.extensions;
  });


  app.controller('NovaServersCtrl', function ($scope, images, flavors, servers,
      apiService, alertService, $modal,
      novaServerModal, novaImageModal, novaFlavorModal, novaConsoleModal) {
    $scope.$root.pageHeading = 'Servers';
    alertService.clearAlerts();

    $scope.flavors = flavors;
    $scope.flavorMap = {};
    angular.forEach(flavors, function (flavor) {
      $scope.flavorMap[flavor.id] = flavor;
    });

    $scope.images = images;
    $scope.imageMap = {};
    angular.forEach(images, function (image) {
      $scope.imageMap[image.id] = image;
    });

    $scope.servers = servers;
    $scope.servers.startRefresh(5000);

    // Cancel interval on page changes
    $scope.$on('$destroy', function () {
      $scope.servers.stopRefresh();
    });

    $scope.showFault = function (server) {
      $modal.open({
        templateUrl: 'showFault.html',
        controller: 'ModalCtrl',
        size: 'lg',
        resolve: {data: function () {return server; }}
      });
    };

    // somewhere to store the new server stuffs
    $scope.newServer = {};
    $scope.createServer = function () {
      alertService.clearAlerts();
      apiService.POST(
        'nova',
        'servers',
        {'server': $scope.newServer},
        function (data) {
          $scope.newServer = {};
          $modal.open({
            templateUrl: 'createResponse.html',
            controller: 'ModalCtrl',
            resolve: {data: function () {return data; }}
          });
        }
      );
    };

    $scope.reboot = function (server) {
      alertService.clearAlerts();
      apiService.POST(
        'nova',
        'servers/' + server.id + '/action',
        {reboot: {type: 'SOFT'}},
        function () {
          alertService.add('info', 'Server rebooting');
        }
      );
    };

    $scope.delete = function (server) {
      alertService.clearAlerts();
      apiService.DELETE(
        'nova',
        'servers/' + server.id,
        function () {
          alertService.add('info', 'Server deleted!');
        }
      );
    };

    $scope.edit = function (server) {
      $modal.open({
        templateUrl: 'views/nova_server_edit.html',
        controller: 'NovaServerEditCtrl',
        size: 'lg',
        resolve: {server: function () {return server; }}
      });
    };

    $scope.serverDetail = function (server) {
      alertService.clearAlerts();
      novaServerModal.open(server.id);
    };

    $scope.console = function (server) {
      alertService.clearAlerts();
      novaConsoleModal.open(server.id);
    };

    $scope.imageDetail = function (image) {
      alertService.clearAlerts();
      novaImageModal.open(image.id);
    };

    $scope.flavorDetail = function (flavor) {
      alertService.clearAlerts();
      novaFlavorModal.open(flavor.id);
    };
  });


  app.controller('NovaServerEditCtrl', function ($scope, $modalInstance, server,
      apiService, alertService) {
    $scope.server = server;

    // "Whenever you have ng-model there’s gotta be a dot in there somewhere.
    // If you don’t have a dot, you’re doing it wrong."
    $scope.formData = {
      name: server.name,
      accessIPv4: server.accessIPv4,
      accessIPv6: server.accessIPv6
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    var putUpdate = function (update) {
      alertService.clearAlerts();
      apiService.PUT(
        'nova',
        'servers/' + $scope.server.id,
        update,
        function () {
          alertService.add('info', 'Server updated.');
          $modalInstance.dismiss('cancel');
        }
      );
    };

    $scope.editName = function () {
      putUpdate({server: {name: $scope.formData.name}});
    };

    $scope.editAccess = function () {
      putUpdate({server: {
        accessIPv4: $scope.formData.accessIPv4,
        accessIPv6: $scope.formData.accessIPv6
      }});
    };

    var postEdit = function (update) {
      alertService.clearAlerts();
      apiService.POST(
        'nova',
        'servers/' + $scope.server.id + '/action',
        update,
        function () {
          alertService.add('info', 'Server updated.');
          $modalInstance.dismiss('cancel');
        }
      );
    };

    $scope.changePassword = function () {
      postEdit({changePassword: {adminPass: $scope.formData.password}});
    };
  });


  app.controller('NovaServerModalCtrl', function ($scope, $modalInstance, data,
      networkModal, apiService, $log) {
    $scope.data = data;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.networkDetail = function (label) {
      $modalInstance.dismiss('cancel');
      $log.debug('FIND network detail for', label);
      apiService.GET('nova', 'os-networks',
        function (data) {
          var i;
          for (i = 0; i < data.networks.length; i++) {
            if (data.networks[i].label === label) {
              networkModal.open(data.networks[i]);
            }
          }
        });
    };
  });


  app.service('novaServerModal', function (apiService, $modal) {
    this.open = function (serverId) {
      apiService.GET('nova', 'servers/' + serverId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_server_detail.html',
            controller: 'NovaServerModalCtrl',
            size: 'lg',
            resolve: {data: function () {return data.server; }}
          });
        });
    };
  });


  app.service('novaConsoleModal', function (alertService, apiService, $modal) {
    this.open = function (serverId) {
      alertService.clearAlerts();
      apiService.POST(
        'nova',
        'servers/' + serverId + '/action',
        {'os-getSerialConsole': {'type': 'serial'}},
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_server_console.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {data: function () {return data.console; }}
          });
        }
      );
    };
  });


  app.controller('NovaNetworksCtrl', function ($log, $scope, apiService,
      alertService, networkModal) {
    $scope.$root.pageHeading = 'Networks';
    alertService.clearAlerts();

    apiService.GET('nova', 'os-networks', function (data) {
      $scope.networks = data.networks;
    });

    $scope.networkDetail = function (network) {
      $log.debug('fetch network info for', network);
      alertService.clearAlerts();
      networkModal.open(network);
    };
  });


  app.service('novaImageModal', function (apiService, $modal) {
    this.open = function (imageId) {
      apiService.GET('nova', 'images/' + imageId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_image_detail.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {data: function () {return data.image; }}
          });
        });
    };
  });


  app.service('novaFlavorModal', function (apiService, $modal) {
    this.open = function (flavorId) {
      apiService.GET('nova', 'flavors/' + flavorId,
        function (data) {
          $modal.open({
            templateUrl: 'views/nova_flavor_detail.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {data: function () {return data.flavor; }}
          });
        });
    };
  });


  app.service('networkModal', function ($modal) {
    this.open = function (network) {
      $modal.open({
        templateUrl: 'views/nova_network_detail.html',
        controller: 'ModalCtrl',
        size: 'lg',
        resolve: {data: function () {return network; }}
      });
    };
  });
}());
