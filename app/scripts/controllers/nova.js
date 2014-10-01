'use strict';

var app = angular.module('app');


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


// the name prefixes on some elements cause trNgGrid to have issues, so just
// strip them off
// maybe trNgGrid isn't a good choice (see the README for the other options I tried)
function filterNames(array) {
  var narray = [];
  angular.forEach(array, function (object) {
    var nobj = {};
    angular.forEach(object, function (value, key) {
      var nkey = key.replace(/(^.+?:)/, '');
      nobj[nkey] = value;
    });
    narray.push(nobj);
  });
  return narray;
}


app.controller('ImagesCtrl', function ($scope, apiService, alertService) {
  $scope.$root.pageHeading = 'Images';
  alertService.clearAlerts();

  apiService.GET('nova', 'images/detail', function (data) {
    $scope.images = filterNames(data.images);
  });
});


app.controller('FlavorsCtrl', function ($scope, apiService, alertService) {
  $scope.$root.pageHeading = 'Flavors';
  alertService.clearAlerts();

  apiService.GET('nova', 'flavors/detail', function (data) {
    $scope.flavors = filterNames(data.flavors);
  });
});


app.controller('ServersCtrl', function ($scope, apiService, alertService, $log) {
  $scope.$root.pageHeading = 'Servers';
  alertService.clearAlerts();

  apiService.GET('nova', 'servers/detail', function (data) {
    $scope.servers = filterNames(data.servers);
  });
  apiService.GET('nova', 'flavors/detail', function (data) {
    $scope.flavors = data.flavors;
  });
  apiService.GET('nova', 'images/detail', function (data) {
    $scope.images = data.images;
  });

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
        if (status === 200) {
          alertService.add('info', 'Server added! ' + data);
          // update the list
          apiService.GET('nova', 'servers/detail', function (data) {
            $scope.servers = filterNames(data.servers);
          });
        }
      },
      function (data) {
        $scope.newServer = {};
        alertService.add('error', 'Server add failed: ' +
                         data.computeFault.message);
      }
    );
  };
});

