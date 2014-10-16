/*global describe, beforeEach, it, inject, module, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Service: api', function () {
    // load the service's module
    beforeEach(module('angboardApp'));

    var api;
    var storage = {access: null};

    beforeEach(function () {
      // mask the local storage service with something of our own fakery
      module(function ($provide) {
        $provide.value('localStorageService', {
          get: function (key) {return storage[key]; },
          set: function (key, value) {storage[key] = value; }
        });
      });

      // and grab a handle to the api service
      inject(function (apiService) {
        api = apiService;
      });
    });

    describe('in the default state', function () {
      it('should not be authenticated', function () {
        expect(api.access).to.equal(null);
      });
    });

    describe('when logged in', function () {
      beforeEach(function () {
        api.setAccess('yes');
      });

      it('should be authenticated', function () {
        expect(api.access).to.equal('yes');
      });
    });
  });
}());