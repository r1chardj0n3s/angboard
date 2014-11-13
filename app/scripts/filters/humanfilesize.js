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
   * @ngdoc filter
   * @name angboardApp.filter:humanFileSize
   * @function
   * @description
   * # humanFileSize
   * Filter in the angboardApp.
   */
  angular.module('angboardApp')
    .filter('humanFileSize', function () {
      return function (bytes, si) {
        // Stolen from http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
        // Note does not cope with -ve bytes
        var thresh = si ? 1000 : 1024,
          units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'],
          u = -1;

        if (bytes < thresh) {
          return bytes + ' B';
        }

        do {
          bytes /= thresh;
          u = u + 1;
        } while (bytes >= thresh);
        return bytes.toFixed(1)  +  ' '  +  units[u];
      };
    });
}());