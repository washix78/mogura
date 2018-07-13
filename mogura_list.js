'use strict';

var log4js = require('log4js');
var path = require('path');

var DirWalker = require('./dir_walker');

log4js.configure('./config/log4js.json');
var log = log4js.getLogger('list');

var MoguraList = function(dpath, options) {
  if (options === undefined || options === null) {
    throw new Error('no options');
  }

  var type = options.type;
  var names = Array.isArray(options.name) ? options.names : null;
  var extensions = Array.isArray(options.extensions) ? options.extensions : null;

  var walker = null;
  if (type === 'all') {
    walker = new DirWalker(dpath);
  } else if (type === 'names') {
    walker = new DirWalker(dpath, (fpath) => {
      var name = path.basename(fpath);
      return name.indexOf('.') === -1 && names.indexOf(name) !== -1;
    });
  } else if (type === 'extensions') {
    walker = new DirWalker(dpath);
  } else {
    throw new Error('not supported type');
  }

  log.info('start:' + type);
  var count = walker.start();
  log.info('end:' + type + ' (' + count + ')');
};

module.exports = MoguraList;
