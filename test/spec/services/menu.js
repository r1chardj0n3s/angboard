'use strict';

describe('Service: menu', function () {

  // load the service's module
  beforeEach(module('angboardApp'));

  // instantiate service
  var menu;
  beforeEach(inject(function (_menu_) {
    menu = _menu_;
  }));

  it('should do something', function () {
    expect(!!menu).toBe(true);
  });

});
