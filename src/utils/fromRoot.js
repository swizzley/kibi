let _ = require('lodash');
let root = require('./packageJson').__dirname;
var { join, dirname, normalize } = require('path');

module.exports = _.flow(_.partial(join, root), normalize);
