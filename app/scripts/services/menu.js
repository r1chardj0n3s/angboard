'use strict';

/**
 * @ngdoc service
 * @name app.menuService
 * @description
 * # menu
 * Service in the app.
 */
angular.module('app')
  .service('menuService', function menu() {
    var self = this;
    self.menus = [];
    self.visible = true;

    this.push = function (value) {
      return self.menus.push(value);
    };

    this.list = function () {
      if (self.visible) {
        return self.menus;
      }
      return [];
    };

    this.shouldShow = function (menu) {
      if (menu.hasOwnProperty('show')) {
        return menu.show();
      }
      return true;
    };
  });
