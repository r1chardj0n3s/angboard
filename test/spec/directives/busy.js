'use strict';

describe('Directive: busy', function () {

  // load the directive's module
  beforeEach(module('angboardApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<busy></busy>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the busy directive');
  }));
});
