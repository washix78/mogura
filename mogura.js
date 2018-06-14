'use strict';

var config = require('config');
var fs = require('fs');
var log4js = require('log4js');
var md5File = require('md5-file');
var path = require('path');

var DirWalker = require('./dir_walker');
var utils = require('./utils');

log4js.configure('./config/log4js.json');
var logger = log4js.getLogger('mogura');

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
    if (option === undefined || option === null) {
      logger.info('list all files');
      var allFilePaths = utils.getAllFilePaths(targetDirPath);
      logger.info(allFilePaths.length);
      utils.writeArrayToFile(config.result.list, allFilePaths);
    } else {
      logger.info('list files filtered by extensions');

      var extensions = config.extensions[option];
      if (extensions === undefined || extensions === null) {
        throw new Error('unusable specified extensions');
      }
      var filteredFilePaths = utils.getAllFilePaths(targetDirPath).filter((filePath) => {
        var extension = utils.getExtension(path.basename(filePath));
        return extension !== undefined &&
          extension !== null &&
          extensions.indexOf(extension) !== -1;
      });

      logger.info('filtered file count: ' + filteredFilePaths.length);
      utils.writeArrayToFile(config.result.list, filteredFilePaths);
    }
    break;

  case 'delete':
    logger.info('simulate deleteing');

    var filePaths = utils.getAllFilePaths(targetDirPath);
    logger.info('all file count: ' + filePaths.length);

    var uniqueFilePaths = [];
    var sameFilePaths = [];

    while (0 < filePaths.length) {
      var uniqueFilePath = filePaths.shift();
      var uniqueFileHash = md5File.sync(uniqueFilePath);
      uniqueFilePaths.push(uniqueFilePath);

      for (var i = filePaths.length - 1; 0 <= i; i--) {
        var testFilePath = filePaths[i];
        var testFileHash = md5File.sync(testFilePath);
        if (uniqueFileHash === testFileHash) {
          sameFilePaths.push(testFilePath);
          filePaths.splice(i, 1);
        }
      }
    }

    logger.info('unique file count: ' + uniqueFilePaths.length);
    logger.info('same file count: ' + sameFilePaths.length);
    utils.writeArrayToFile(config.result.delete.unique, uniqueFilePaths);
    utils.writeArrayToFile(config.result.delete.same, sameFilePaths);

    if (option === '-f') {
      logger.info('do deleteing');

      sameFilePaths.forEach((filePath) => {
        try {
          fs.unlinkSync(filePath);
          logger.info('succee: ' + filePath);
        } catch (e) {
          logger.error('fail: ' + filePath);
          logger.error(e.stack);
        }
      });
    }
    break;

  case 'util':
    if (option === 'extension') {
      var extensions = new Set();
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          var fileName = path.basename(filePath);
          var extension  = utils.getExtension(path.basename(filePath));
          if (extension !== null) {
            extensions.add(extension);
          }
        });
      }).start();

      logger.info('extension count: ' + extensions.size);
      utils.writeArrayToFile(config.result.util.extension, Array.from(extensions).sort());
    }
    break;

  default:
    throw new Error('unsupported command');
  }
} catch (e) {
  logger.error(e.stack);
}
