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

  describe('Directive: console', function () {

    // load the directive's module
    beforeEach(module('angboardApp'));

    var element, scope;

    beforeEach(function () {
      module(function ($provide) {

        // this mocking is a bit yuck, but the actual mocking provided by ng-
        // websocket is odd
        $provide.decorator('$websocket', function ($delegate) {
          $delegate.$new = function (url, protocols) {
            return {
              url: url,
              protocols: protocols,
              sent: [],
              $$ws: {
                send: function (data) {this.sent.push(data); }
              },
              $status: function () {return 1; },  // status OPEN
              $on: function (evt, handler) {expect(evt).not.to.equal(handler); }
            };
          };
          return $delegate;
        });
      });

      // and grab a handle to the api service
      inject(function ($rootScope) {
        scope = $rootScope.$new();
        scope.conn = {url: 'I_AM_CONNECTION'};
      });
    });

    it('should do very little', inject(function ($compile) {
      element = angular.element('<console connection="conn"></console>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element.text()).to.equal('Status: OPEN');
    }));
  });
}());