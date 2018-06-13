'use strict';

var config = require('config');
var fs = require('fs');
var md5File = require('md5-file');
var os = require('os');
var path = require('path');

var DirWalker = require('./dir_walker');
var utils = require('./utils');

try {
  if (process.argv.length < 4) {
    throw new Error('specify directory path & command');
  }

  var targetDirPath = path.resolve(process.argv[2]);
  if (!fs.statSync(targetDirPath).isDirectory()) {
    throw new Error('not directory');
  }

  var command = process.argv[3];
  var option = (5 <= process.argv.length) ? process.argv[4] : null;

  switch (command) {
  case 'list':
    var extensions = config.extensions[option];

    var allFilePaths = (extensions === undefined || extensions === null) ?
      utils.getAllFilePaths(targetDirPath) :
      utils.getAllFilePaths(targetDirPath).filter((filePath) => {
        var extension = utils.getExtension(filePath);
        return extension !== undefined &&
          extension !== null &&
          extensions.indexOf[extension] !== -1;
      });

    utils.writeArrayToFile(config.result.list, allFilePaths);

    break;

  case 'delete':
    var filePaths = utils.getAllFilePaths(targetDirPath);
    var uniqueFilePaths = [];
    var sameFilePaths = [];

    while (0 < filePaths.length) {
      var uniqueFilePath = filePaths.shift();
      var uniqueFileHash = md5File.sync(uniqueFilePath);
      uniqueFilePaths.push(uniqueFilePath);

      for (var i = filePaths.length - 1; 0 < i; i--) {
        var testFilePath = filePaths[i];
        var testFileHash = md5File.sync(testFilePath);
        if (uniqueFileHash === testFilePath) {
          sameFilePaths.push(testFilePath);
          filePaths.splice(i, 1);
        }
      }
    }

    utils.writeArrayToFile(config.result.delete.unique, uniqueFilePaths);
    utils.writeArrayToFile(config.result.delete.same, sameFilePaths);

    break;

  case 'util':
    if (option === 'extension') {
      var extensions = new Set();
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          var fileName = path.basename(filePath);
          var extension  = utils.getExtension(path.basename(filePath));
          if (extension !== null) {
            extensions.push(extension);
          }
        });
      }).start();

      utils.writeArrayToFile(config.result.util, Array.from(extensions).sort());
    }
    break;

  default:
    throw new Error('unsupported command');
  }
} catch (e) {
  console.log(e.stack);
  // TODO: output log
}
