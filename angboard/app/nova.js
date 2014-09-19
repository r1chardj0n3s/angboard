var appControllers = angular.module('appControllers');


appControllers.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/nova/images', {
      templateUrl: 'app/partials/nova_images.html'
    });
    $routeProvider.when('/nova/flavors', {
      templateUrl: 'app/partials/nova_flavors.html'
    });
  }
]);


appControllers.run([
  'menuService',
  function (menuService) {
    var menu = {'title': 'Compute', 'action': '#', 'menus': []};
    menu.menus.push({'title': 'Images', 'action': '#/nova/images'});
    menu.menus.push({'title': 'Flavors', 'action': '#/nova/flavors'});
    menuService.menus.push(menu);
  }
]);




appControllers.controller('ImagesCtrl', [
  '$scope', 'apiService', 'alertService',
  function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = "Images";
    alertService.clearAlerts();

    $scope.apiService = apiService;

    apiService.GET(
      'nova',
      "images",
      function (data) {
        $scope.images = data.images;
      }
    );
  }
]);


appControllers.controller('FlavorsCtrl', [
  '$scope', 'apiService', 'alertService',
  function ($scope, apiService, alertService) {
    $scope.$root.pageHeading = "Flavors";
    alertService.clearAlerts();

    $scope.apiService = apiService;

    apiService.GET(
      'nova',
      "flavors/detail",
      function (data) {
        $scope.flavors = data.flavors;
      }
    );
  }
]);
