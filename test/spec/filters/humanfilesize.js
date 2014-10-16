/*global describe, beforeEach, inject, module, it, chai */
(function () {
  'use strict';

  var expect = chai.expect;

  describe('Filter: humanFileSize', function () {

    // load the filter's module
    beforeEach(module('angboardApp'));

    // initialize a new instance of the filter before each test
    var humanFileSize;
    beforeEach(inject(function ($filter) {
      humanFileSize = $filter('humanFileSize');
    }));

    it('should format kilobytes', function () {
      expect(humanFileSize(1024)).to.equal('1.0 KiB');
      expect(humanFileSize(1536)).to.equal('1.5 KiB');
    });

    it('should format megabytes', function () {
      expect(humanFileSize(1024 * 1024)).to.equal('1.0 MiB');
      expect(humanFileSize(1536 * 1024)).to.equal('1.5 MiB');
    });

    it('should format gigabytes', function () {
      expect(humanFileSize(1024 * 1024 * 1024)).to.equal('1.0 GiB');
      expect(humanFileSize(1536 * 1024 * 1024)).to.equal('1.5 GiB');
    });
  });
}());