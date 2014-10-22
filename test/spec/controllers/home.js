/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Controller: HomeCtrl', function () {

    // load the controller's module
    beforeEach(module('angboardApp'));

    var scope, createController;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {

      scope = $rootScope.$new();
      createController = function () {
        return $controller('HomeCtrl', {$scope: scope, limits: 'limits yes'});
      };
    }));

    it('should fetch limits onto the scope', function () {
      createController();
      expect(scope.limits).to.equal('limits yes');
    });
  });
}());