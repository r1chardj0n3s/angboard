/*global describe, beforeEach, inject, module, it, expect, angular */
(function () {
  'use strict';

  describe('Service: alert', function () {

    // load the service's module
    beforeEach(module('angboardApp'));

    // instantiate service
    var alert, rootScope;
    beforeEach(inject(function (alertService, $rootScope) {
      alert = alertService;
      rootScope = $rootScope;
    }));

    it('should allow alerts to be added', function () {
      alert.add('info', 'hi');
      // seriously, this is how we compare values deeply :(
      expect(angular.toJson(rootScope.alerts)).toBe(angular.toJson([{type: 'info', msg: 'hi'}]));
    });

  });
}());