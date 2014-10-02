'use strict';

describe('Filter: humanFileSize', function () {

  // load the filter's module
  beforeEach(module('angboardApp'));

  // initialize a new instance of the filter before each test
  var humanFileSize;
  beforeEach(inject(function ($filter) {
    humanFileSize = $filter('humanFileSize');
  }));

  it('should return the input prefixed with "humanFileSize filter:"', function () {
    var text = 'angularjs';
    expect(humanFileSize(text)).toBe('humanFileSize filter: ' + text);
  });

});
