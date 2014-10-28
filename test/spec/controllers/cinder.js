/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Controller: CinderCtrl', function () {

    // load the controller's module
    beforeEach(module('angboardApp'));

    var scope, createController;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      createController = function () {
        return $controller('CinderCtrl', {$scope: scope});
      };
    }));

    it('should attach a list of awesomeThings to the scope', function () {
      createController();
      expect(scope.awesomeThings.length).toBe(3);
    });
  });
}());