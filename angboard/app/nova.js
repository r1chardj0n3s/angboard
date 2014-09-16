var appControllers = angular.module('appControllers');


appControllers.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/nova/images', {
      templateUrl: 'app/partials/nova_images.html'
    });
  }
]);


appControllers.run([
  'menuService',
  function (menuService) {
    var menu = {'title': 'Home', 'action': '#/nova/images'};
    menuService.menus.push(menu);
  }
]);


appControllers.controller('ImagesCtrl', [
  '$scope', 'apiService', 'alertService', 'ngTableParams', '$filter',
  function ($scope, apiService, alertService, ngTableParams, $filter) {
    $scope.$root.pageHeading = "Images";
    alertService.clearAlerts();

    $scope.apiService = apiService;

    apiService.GET(
      'nova',
      "images",
      function (data) {
        $scope.images = data.images;

        /*jslint newcap: true*/
        $scope.tableParams = new ngTableParams({
          page: 1,
          count: 10,
          sorting: {
            'name': 'asc'
          }
        }, {
          getData: function ($defer, params) {
            var filteredData = params.filter() ?
                    $filter('filter')($scope.images, params.filter()) :
                    $scope.images;
            var orderedData = params.sorting() ?
                    $filter('orderBy')(filteredData, params.orderBy()) :
                    $scope.images;
            // set total for recalc pagination
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(),
              params.page() * params.count()));

            // work-around for pagination and filtering issue
            // https://github.com/esvit/ng-table/issues/133
            if (params.total() < (params.page() - 1) * params.count()) {
              params.page(1);
            }
          }
        });

      });
  }
]);
