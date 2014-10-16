/*global describe, beforeEach, inject, module, it, expect */
(function () {
  'use strict';

  describe('Directive: checkmark', function () {

    // load the directive's module
    beforeEach(module('angboardApp'));

    var element,
      scope;

    beforeEach(inject(function ($rootScope, $httpBackend) {
      scope = $rootScope.$new();
      // we $digest so we need to handle the nova run() extension fetch
      $httpBackend.when('GET', '/api/nova/RegionOne/extensions')
        .respond({extensions: []});
    }));

    it('should have a checkmark when true', inject(function ($compile) {
      element = angular.element('<div x-checkmark="checked"></div>');
      element = $compile(element)(scope);
      scope.checked = true;
      scope.$digest();
      expect(element.html()).toBe('<span class="fa fa-check"></span>');
    }));

    it('should have a cross when false', inject(function ($compile) {
      element = angular.element('<div x-checkmark="checked"></div>');
      element = $compile(element)(scope);
      scope.checked = false;
      scope.$digest();
      expect(element.html()).toBe('<span class="fa fa-times"></span>');
    }));
  });
}());