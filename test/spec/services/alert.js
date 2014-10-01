/*global describe, beforeEach, inject, it, expect */
'use strict';

describe('Service: alert', function () {

  // load the service's module
  beforeEach(module('angboardApp'));

  // instantiate service
  var alert;
  beforeEach(inject(function (alertService) {
    alert = alertService;
  }));

  it('should do something', function () {
    expect(!!alert).toBe(false);
  });

});
