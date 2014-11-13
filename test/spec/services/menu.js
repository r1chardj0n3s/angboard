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