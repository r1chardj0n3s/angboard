/*global describe, beforeEach, inject, module, it, expect */
(function () {
  'use strict';

  describe('Controller: HomeCtrl', function () {

    // load the controller's module
    beforeEach(module('angboardApp'));

    var scope, httpBackend, createController;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, apiService, $httpBackend) {
      // we $digest so we need to handle the nova run() extension fetch
      $httpBackend.whenGET('/api/nova/RegionOne/extensions')
        .respond({extensions: []});
      $httpBackend.expectGET('/api/nova/RegionOne/limits')
        .respond({limits: {absolute: 'limits yes'}});
      httpBackend = $httpBackend;

      scope = $rootScope.$new();
      createController = function () {
        return $controller('HomeCtrl', {$scope: scope, apiService: apiService});
      };
    }));

    it('should fetch limits onto the scope', function () {
      createController();
      httpBackend.flush();
      expect(scope.limits).toBe('limits yes');
    });
  });
}());