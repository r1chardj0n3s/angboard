/*global describe, beforeEach, it, inject, module, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Directive: busy', function () {

    // load the directive's module
    beforeEach(module('angboardApp'));

    var element, scope, api;

    beforeEach(function () {
      // mask the api service with something of our own fakery
      module(function ($provide) {
        $provide.value('apiService', {busy: {count: 0}});
      });
      inject(function ($rootScope, apiService) {
        scope = $rootScope.$new();
        api = apiService;
      });
    });

    it('should display its contents', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      expect(element.text()).to.equal('hello');
    }));

    it('should be visible when busy', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      api.busy.count = 1;
      scope.$digest();
      expect(element.hasClass('ng-hide')).to.equal(false);
    }));

    it('should be hidden when not busy', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      api.busy.count = 0;
      scope.$digest();
      expect(element.hasClass('ng-hide')).to.equal(true);
    }));
  });
}());