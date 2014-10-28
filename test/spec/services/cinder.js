/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Service: cinder', function () {

    // load the service's module
    beforeEach(module('angboardApp'));

    // instantiate service
    var cinder;
    beforeEach(inject(function (_cinder_) {
      cinder = _cinder_;
    }));

    it('should do something', function () {
      expect(!!cinder).toBe(true);
    });

  });
}());