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

  var app = angular.module('angboardApp');


  app.config(function ($routeProvider, $translateProvider) {
    $routeProvider.when('/home', {
      controller: 'HomeCtrl',
      templateUrl: 'views/home.html',
      resolve: {
        limits: function (nova) {return nova.limits(); }
      }
    });

    $translateProvider.translations('en', {
      TITLE: 'Hello',
      'This is a paragraph.': 'This is a paragraph.',
      BUTTON_LANG_EN: 'english',
      BUTTON_LANG_DE: 'german'
    });
    $translateProvider.translations('de', {
      TITLE: 'Hallo',
      'This is a paragraph.': 'Dies ist ein Paragraph.',
      BUTTON_LANG_EN: 'englisch',
      BUTTON_LANG_DE: 'deutsch'
    });
    $translateProvider.preferredLanguage('en');
  });


  app.run(function (menuService) {
    var menu = {'title': 'Home', 'action': '#/home'};
    menuService.push(menu);
  });


  // Login Controller
  app.controller('HomeCtrl', function ($scope, limits, $translate) {
    $scope.$root.pageHeading = 'Home';
    $scope.limits = limits.absolute;
    $scope.changeLanguage = function (lang) {
      $translate.use(lang);
    };
  });
}());
