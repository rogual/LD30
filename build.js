var _ = require('lodash');
var fs = require('fs');

var txt =
  'exports.init = function(init) {\n' +
  _.compact(
    fs.readFileSync('src/systems.in', {encoding: 'utf8'}).split('\n')
  ).map(function(name) {
    return '  init("%", require("../src/%"));'.replace(/%/g, name);
  }).join('\n') +
  '\n};';


fs.writeFileSync('gen/systems.js', txt);

var a =
  'module.exports = [' +
  _.compact(fs.readdirSync('assets').map(function(fname) {
    return (/^(.*).png$/.exec(fname) || {})[1];
  })).map(quote).join(', ') +
  '];';


function quote(x) { return '"' + x + '"'; }

fs.writeFileSync('gen/files.js', a);
