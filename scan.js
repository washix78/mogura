'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var md5File = require('md5-file');
var path = require('path');

var utility = require('./utility');

var id = 'scan-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

var isMultiple = (aSize, aHash, bPath) => {
  return (aSize === fs.statSync(bPath).size && aHash === md5File.sync(bPath));
}

try {
  // node scan -(d|f) {dir_or_file_path}
  if (process.argv.length < 4) {
    throw new Error('Please specify a directory or file path.');
  }

  var startDirPath = null;
  var listFpath = null;

  switch (process.argv[2]) {
  case '-d':
    startDirPath = path.resolve(process.argv[3]);
    if (!fs.statSync(startDirPath).isDirectory()) {
      throw new Error('Please specify a directory path.');
    }
    break;
  case '-f':
    listFpath = path.resolve(process.argv[3]);
    if (fs.statSync(listFpath).isDirectory()) {
      throw new Error('Please specify a file path.');
    }
    break;
  default:
    throw new Error('Please specify "-d" or "-f".');
  }

  Promise.resolve().then(() => {

    if (startDirPath !== null) {
      logger.info('Load directory "' + startDirPath + '".');
      return new Promise((resolve, reject) => {
        var fpaths = [];
        utility.walkDir(startDirPath, (dpaths, plus) => {
          Array.prototype.push.apply(fpaths, plus);
        });
        resolve(fpaths);
      });
    } else {
      logger.info('Load from file "' + listFpath + '".');
      return utility.getLinesFromFile(listFpath, (line) => {
        return !line.startsWith('#');
      });
    }

  }).then((testPaths) => {

    logger.info('Loaded file path count: ' + testPaths.length);

    var writer = utility.getFileWriter('./logs/' + id + '.txt');

    while (0 < testPaths.length) {
      var aPath = testPaths.shift();
      var aSize = null;
      var aHash = null;
      logger.info('A: ' + aPath);
      try {
        aSize = fs.statSync(aPath).size;
        aHash = md5File.sync(aPath);
      } catch (e) {
        logger.error(aPath + ': ' + e.stack);
        continue;
      } finally {
        writer.write('#' + aPath);
      }

      var checkedIdxes = [];

      for (var idx = 0; idx < testPaths.length; idx++) {
        var bPath = testPaths[idx];
        logger.info('  B: ' + bPath);
        try {
          if (isMultiple(aSize, aHash, bPath)) {
            checkedIdxes.push(idx);
            writer.write(bPath);
            logger.info(' - same');
          }
        } catch (e) {
          logger.error(bPath + ': ' + e.stack);
          checkedIdxes.push(idx);
        }
      }

      // exclude checked indexes
      while (0 < checkedIdxes.length) {
        var idx = checkedIdxes.pop();
        testPaths.splice(idx, 1);
      }
    }

    writer.finish();
    logger.info('End.');

  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
