/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Service: menu', function () {
    // load the service's module
    beforeEach(module('angboardApp'));

    // instantiate service
    var menu;
    beforeEach(inject(function (menuService) {
      menu = menuService;
    }));

    it('should not be empty by default', function () {
      expect(menu.list()).to.not.deep.equal([]);
    });

    it('should be empty when not visible', function () {
      menu.visible = false;
      expect(menu.list()).to.deep.equal([]);
    });

    it('should accept new menu items', function () {
      var newItem = {spam: 'ham'};
      menu.push(newItem);
      expect(menu.list()).to.contain(newItem);
    });

    it('should show self-controlled menu items', function () {
      var newItem = {spam: 'ham', show: function () {return true; }};
      expect(menu.shouldShow(newItem)).to.equal(true);
    });

    it('should not show self-hidden menu items', function () {
      var newItem = {spam: 'ham', show: function () {return false; }};
      expect(menu.shouldShow(newItem)).not.to.equal(true);
    });

  });
}());