'use strict';

var Ajv = require('ajv');
var ajvIstanbul = require('.');
var assert = require('assert');
var istanbul = require('istanbul');

describe('ajv-istanbul', () => {
  var ajv;

  beforeEach(() => {
    ajv = new Ajv;
    delete global.__coverage__;
  });

  it('should allow chaining with other plugins', () => {
    assert.equal(ajvIstanbul(ajv), ajv);
  });

  it('should extend ajv instance to add instrumentation of generation code', () => {
    ajvIstanbul(ajv);
    var validate = ajv.compile({
      type: 'integer',
      minimum: 1,
      maximum: 9
    });

    validate(0);

    assert.equal(typeof global.__coverage__, 'object');
  });

  it('should allow generating coverage reports', (done) => {
    ajvIstanbul(ajv);
    var validate = ajv.compile({
      id: 'test_integer_schema.json',
      type: 'integer',
      minimum: 1,
      maximum: 9
    });

    assert.strictEqual( validate(0),   false );
    assert.strictEqual( validate(5),   true );
    assert.strictEqual( validate(10),  false );
    assert.strictEqual( validate(1.1), false );
    assert.strictEqual( validate('a'), false );
    assert.strictEqual( validate(NaN), false );

    var collector = new istanbul.Collector();
    var reporter = new istanbul.Reporter();
    var sync = true;

    collector.add(global.__coverage__);

    reporter.add('text');
    reporter.addAll([ 'lcov', 'html' ]);

    var oldLog = console.log;
    console.log = log;
    var logged;

    reporter.write(collector, sync, function () {
      console.log = oldLog;
      console.log('reports generated');
      console.log(logged);
      assert.equal(logged.match(/[^0-9]100[^0-9]/g).length, 9, '100% in 9 places');
      done();
    });

    function log(str) {
      logged = str;
    }
  });
});
