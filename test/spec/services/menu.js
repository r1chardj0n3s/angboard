/*global describe, beforeEach, inject, it, expect, module */
(function () {
  'use strict';

  describe('Service: menu', function () {
    // load the service's module
    beforeEach(module('angboardApp'));

    // instantiate service
    var menu;
    beforeEach(inject(function (menuService) {
      menu = menuService;
    }));

    it('should not be empty by default', function () {
      expect(menu.list()).not.toEqual([]);
    });

    it('should be empty when not visible', function () {
      menu.visible = false;
      expect(menu.list()).toEqual([]);
    });

    it('should accept new menu items', function () {
      var newItem = {spam: 'ham'};
      menu.push(newItem);
      expect(menu.list()).toContain(newItem);
    });

    it('should show self-controlled menu items', function () {
      var newItem = {spam: 'ham', show: function () {return true; }};
      expect(menu.shouldShow(newItem)).toBe(true);
    });

    it('should not show self-hidden menu items', function () {
      var newItem = {spam: 'ham', show: function () {return false; }};
      expect(menu.shouldShow(newItem)).not.toBe(true);
    });

  });
}());