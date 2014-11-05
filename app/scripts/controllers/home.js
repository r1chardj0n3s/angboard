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
