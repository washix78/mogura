'use strict';

var fs = require('fs');
var log4js = require('log4js');
var path = require('path');

log4js.configure('./config/log4js.json');

var log = log4js.getLogger('dir_walker');

var DirWalker = function(startDpath, fpathFilter) {
  var filteredFpaths = [];

  var walk = (topDpath) => {
    log.info(topDpath);
    var paths = fs.readdirSync(dpath).map((name) => {
      return path.resolve(topDpath, name);
    });
    var dpaths = [];
    var fpaths = [];
    paths.forEach((testPath) => {
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        fpaths.push(testPath);
      }
    });

    if ('function' === typeof fpathFilter) {
      Array.prototype.push.apply(filteredFpaths, fpaths.filter(fpathFilter));
    } else {
      Array.prototype.push.apply(filteredFpaths, fpaths);
    }

    dpaths.forEach((dpath) => {
      walk(dpath);
    });
  };

  this.start = () => {
    log.info('start');
    walk(path.resolve(startDpath));
    log.info('end (' + filteredFpaths.length + ')');
    return filteredFpaths;
  };
};

module.exports = DirWalker;
