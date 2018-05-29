'use strict';

var config = require('config');
var fs = require('fs');
var os = require('os');
var path = require('path');

var DirWalker = require('./dir_walker');

try {
  if (process.argv.length < 3) {
    throw new Error(/* TODO */);
  }
  if (process.argv.length < 4) {
    throw new Error(/* TODO */);
  }

  var targetDirPath = path.resolve(process.argv[2]);
  if (!fs.statSync(targetDirPath).isDirectory()) {
    throw new Error(/* TODO */);
  }

  var command = process.argv[3];
  var option = (5 < process.argv.length) ? process.argv[4] : null;
  if (command === 'list') {
    if (option === '-e') {
      var extensions = [];
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          var fileName = path.basename(filePath);
          var extensionI = fileName.indexOf('.');
          if (extensionI !== -1) {
            var extension = fileName.substr(extensionI + 1);
            extensions.push(extension);
          }
        });
      }).start();
      logger.info('extension count: ' + extensions.length);
      var ws = fs.createWriteStream(config.data.list.extension.filePath).on('error', (err) => {
        throw err;
      });
      extensions.sort().forEach((extension) => {
        ws.write(extension);
        ws.write(os.EOL);
      });
    } else {
      var ws = fs.createWriteStream(config.data.list.filePath /* TODO */).on('error', (err) => {
        throw err;
      });
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          ws.write(filePath);
          ws.write(os.EOL);
        });
      }).start();
    }
  } else if (command === 'delete') {
    if (option === '-f') {

    } else {

    }
  } else {
    throw new Error(/* TODO */);
  }
} catch (e) {
  // TODO: output log
}
