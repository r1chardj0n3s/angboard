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
    .run(function ($rootScope, menuService) {
      $rootScope.$on('login', function () {
        menuService.visible = true;
      });
      $rootScope.$on('logout', function () {
        menuService.visible = false;
      });
    })

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