'use strict';

/**
 * @ngdoc service
 * @name app.menu
 * @description
 * # menu
 * Service in the app.
 */
angular.module('app')
  .service('menuService', function menu() {
    var menus = [];
    var visible = true;

    this.push = function (value) {
      return menus.push(value);
    };

    this.list = function () {
      if (visible) {
        return menus;
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
