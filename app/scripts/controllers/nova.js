(function () {
  'use strict';

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
  });


  app.run(function (menuService) {
    var menu = {'title': 'Compute', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Images', 'action': '#/nova/images'});
    menu.menus.push({'title': 'Flavors', 'action': '#/nova/flavors'});
    menu.menus.push({'title': 'Servers', 'action': '#/nova/servers'});
    menuService.push(menu);
  });


  app.controller('ImagesCtrl', function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = 'Images';
    alertService.clearAlerts();

    apiService.GET('nova', 'images/detail', function (data) {
      $scope.images = data.images;
    });
  });


  app.controller('FlavorsCtrl', function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = 'Flavors';
    alertService.clearAlerts();

    apiService.GET('nova', 'flavors/detail', function (data) {
      $scope.flavors = data.flavors;
    });
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

  app.controller('ServersCtrl', function ($scope, apiService, alertService, $log, $interval, $modal) {
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
      } else {
        url = 'servers/detail';
      }
      self.lastFetch = new Date();
      $log.debug('refresh servers ', url);
      apiService.GET('nova', url, function (data) {
        if (update) {
          updateArray($scope.servers, data.servers);
        } else {
          // first fetch
          $scope.servers = data.servers;
        }
      }, null, false);
    };

    var refreshPromise = $interval(refreshServers, 1000);

    // Cancel interval on page changes
    $scope.$on('$destroy', function () {
      if (angular.isDefined(refreshPromise)) {
        $interval.cancel(refreshPromise);
        refreshPromise = undefined;
      }
    });

    var ModalCtrl = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

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
  });
}());