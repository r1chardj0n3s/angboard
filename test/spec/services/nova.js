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

/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Service: nova', function () {

    // load the service's module
    beforeEach(module('angboardApp'));

    // instantiate service
    var nova;
    beforeEach(inject(function (_nova_) {
      nova = _nova_;
    }));

    it('should do something', function () {
      expect(!!nova).toBe(true);
    });

  });
}());