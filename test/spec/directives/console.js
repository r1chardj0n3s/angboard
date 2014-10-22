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