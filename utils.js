'use strict';

var fs = require('fs');
var log4js = require('log4js');
var os = require('os');

var DirWalker = require('./dir_walker');

log4js.configure('./config/log4js.json');
var logger = log4js.getLogger('utils');

module.exports = {
  getExtension: (src) => {
    var extensionI = src.lastIndexOf('.');
    if (extensionI !== -1) {
      var extension = src.substr(extensionI + 1).toLowerCase();
      return extension;
    } else {
      return null;
    }
  },
  getAllFilePaths: (targetDirPath) => {
    var allFilePaths = [];
    new DirWalker(targetDirPath, (filePaths) => {
      Array.prototype.push.apply(allFilePaths, filePaths);
    }).start();
    return allFilePaths;
  },
  writeArrayToFile: (filePath, array) => {
    var ws = fs.createWriteStream(filePath).
      on('error', (err) => {
        throw err;
      }).
      on('finish', () => {
        logger.debug('write to ' + filePath + ' end');
      });

    logger.debug('write to ' + filePath + ' start');
    array.forEach((item) => {
      ws.write(item);
      ws.write(os.EOL);
    })
    ws.end();
  }
};
