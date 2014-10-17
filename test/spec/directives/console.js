/*global describe, beforeEach, it, inject, module, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Directive: console', function () {

    // load the directive's module
    beforeEach(module('angboardApp'));

    var element,
      scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should do very little', inject(function ($compile) {
      element = angular.element('<console></console>');
      element = $compile(element)(scope);
      expect(element.text()).to.equal('');
    }));
  });
}());