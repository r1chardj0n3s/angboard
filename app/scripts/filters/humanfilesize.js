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