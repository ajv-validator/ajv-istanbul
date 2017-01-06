'use strict';

var beautify = require('js-beautify').js_beautify;
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter({embedSource: true});


module.exports = function (ajv) {
  compileAddedSchemas(ajv, '_refs');
  compileAddedSchemas(ajv, '_schemas');
  ajv._opts.processCode = instrument;
  return ajv;
};


function compileAddedSchemas(ajv, schemasKey) {
  for (var key in ajv[schemasKey]) ajv.getSchema(key);
}


function instrument(code) {
  code = beautify(code, { indent_size: 2 });
  return instrumenter.instrumentSync(code);
}
