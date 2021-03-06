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

  describe('Controller: HomeCtrl', function () {

    // load the controller's module
    beforeEach(module('angboardApp'));

    var scope, createController;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {

      scope = $rootScope.$new();
      createController = function () {
        return $controller('HomeCtrl', {$scope: scope, limits: 'limits yes'});
      };
    }));

    it('should fetch limits onto the scope', function () {
      createController();
      expect(scope.limits).to.equal('limits yes');
    });
  });
}());