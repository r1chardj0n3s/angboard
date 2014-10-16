/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Controller: HomeCtrl', function () {

    // load the controller's module
    beforeEach(module('angboardApp'));

    var scope, httpBackend, createController;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, apiService, $httpBackend) {
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
      expect(scope.limits).to.equal('limits yes');
    });
  });
}());