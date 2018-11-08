'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var md5File = require('md5-file');
var path = require('path');

var utility = require('./utility');

var id = 'scan-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

var singles = [];
var multiples = [];
var errors = [];
var isMultiple = (testFpath) => {
  var testFsize = fs.statSync(testFpath).size;
  var testFhash = md5File.sync(testFpath);

  for (var i = 0; i < singles.length; i++) {
    var single = singles[i];
    if (testFsize === fs.statSync(single).size && testFhash === md5File.sync(single)) {
      return true;
    }
  }
  return false;
};

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
        utility.walkDir(startDirPath, (plus) => {
          Array.prototype.push.apply(fpaths, plus);
        });
        resolve(fpaths);
      });
    } else {
      logger.info('Load from file "' + listFpath + '".');
      return utility.getLinesFromFile(listFpath);
    }

  }).then((fpaths) => {

    logger.info('Loaded file path count: ' + fpaths.length);

    while (0 < fpaths.length) {
      var testPath = fpaths.shift();
      logger.info(testPath);
      try {
        if (isMultiple(testPath)) {
          logger.info('  - ' + testPath);
          multiples.push(testPath);
        } else {
          singles.push(testPath);
        }
      } catch (e) {
        logger.error('Failed "' + testPath + '".');
        logger.error(e.stack);
        errors.push(testPath);
      }
    }
    logger.info('Single count: ' + singles.length);
    logger.info('Multiple count: ' + multiples.length);
    logger.info('Error count: ' + errors.length);

    var singlesWriter = utility.getFileWriter('./logs/' + id + '-singles.txt');
    singles.forEach((single) => {
      singlesWriter.write(single);
    });
    singlesWriter.finish();

    var multiplesWriter = utility.getFileWriter('./logs/' + id + '-multiples.txt');
    multiples.forEach((multiple) => {
      multiplesWriter.write(multiple);
    });

    logger.info('End.');

  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
