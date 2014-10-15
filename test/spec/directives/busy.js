/*global describe, beforeEach, inject, module, it, expect */
(function () {
  'use strict';

  describe('Directive: busy', function () {

    // load the directive's module
    beforeEach(module('angboardApp'));

    var element, scope, api;

    beforeEach(function () {
      // mask the api service with something of our own fakery
      module(function ($provide) {
        // this is a total hack but nova does a GET in its run()
        $provide.value('apiService', {busy: 0, GET: function () {return; }});
      });
      inject(function ($rootScope, apiService) {
        scope = $rootScope.$new();
        api = apiService;
      });
    });

    it('should display its contents', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      expect(element.text()).toBe('hello');
    }));

    it('should be visible when busy', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      api.busy = 1;
      scope.$digest();
      expect(element.hasClass('ng-hide')).toBe(false);
    }));

    it('should be hidden when not busy', inject(function ($compile) {
      element = angular.element('<busy>hello</busy>');
      element = $compile(element)(scope);
      api.busy = 0;
      scope.$digest();
      expect(element.hasClass('ng-hide')).toBe(true);
    }));
  });
}());