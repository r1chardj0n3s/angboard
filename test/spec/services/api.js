/*
Copyright 2014, Rackspace, US, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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