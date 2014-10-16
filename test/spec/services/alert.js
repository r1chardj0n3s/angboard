/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

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
      expect(rootScope.alerts).to.deep.equal([{type: 'info', msg: 'hi'}]);
    });

  });
}());