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

    var sizeMap = {};
    testPaths.forEach((testPath) => {
      try {
        var size = fs.statSync(testPath).size;
        if (!(size in sizeMap)) {
          sizeMap[size] = [];
        }
        sizeMap[size].push(testPath);
      } catch (e) {
        logger.error(testPath + ' ' + e.stack);
      }
    });

    var writer = utility.getFileWriter('./logs/' + id + '.txt');

    for (var size in sizeMap) {
      var hashMap = {};
      sizeMap[size].forEach((fpath) => {
        var hash = md5File.sync(fpath);
        if (!(hash in hashMap)) {
          hashMap[hash] = [];
        }
        hashMap[hash].push(fpath);
      });

      for (var hash in hashMap) {
        var sameCount = hashMap[hash].length;
        if (1 < sameCount) {
          logger.debug('Same count: ' + sameCount + ', hash: ' + hash);
        }

        hashMap[hash].forEach((fpath, i) => {
          if (i == 0) {
            writer.write('#' + fpath);
          } else {
            writer.write(fpath);
            logger.debug(fpath);
          }
        });
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
