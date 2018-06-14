'use strict';

var fs = require('fs');
var log4js = require('log4js');
var path = require('path');

log4js.configure('./config/log4js.json');
var logger = log4js.getLogger('dirWalker');

var DirWalker = function(startDirPath, afterFilePathsGetting) {
  var walk = (rootDirPath) => {
    logger.debug(rootDirPath);

    var paths = fs.readdirSync(rootDirPath).map((name) => {
      return path.resolve(rootDirPath, name);
    });

    var dirPaths = [];
    var filePaths = [];
    paths.forEach((path) => {
      if (fs.statSync(path).isDirectory()) {
        dirPaths.push(path);
      } else {
        filePaths.push(path);
      }
    });

    if (afterFilePathsGetting !== undefined && afterFilePathsGetting !== null) {
      afterFilePathsGetting(filePaths);
    }

    var fileCount = filePaths.length;
    dirPaths.forEach((dirPath) => {
      fileCount += walk(dirPath);
    });
    return fileCount;
  };
  this.start = () => {
    var fileCount = walk(startDirPath);
    logger.info('file count: ' + fileCount);
    return fileCount;
  };
};

module.exports = DirWalker;
