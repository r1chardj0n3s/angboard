(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name angboardApp.menuService
   * @description
   * # menu
   * Service in the angboardApp.
   */
  angular.module('angboardApp')
    .service('menuService', function menu() {
      var self = this;
      self.visible = true;
      var menus = [];

      this.push = function (value) {
        return menus.push(value);
      };

      this.list = function () {
        if (self.visible) {
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
}());