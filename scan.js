'use strict';

var config = require('config');
var dateformat = require('dateformat');
var fs = require('fs');
var log4js = require('log4js');
var md5File = require('md5-file');
var path = require('path');

var FileWriter = require('./file_writer');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

log4js.configure({
  'appenders': {
    'stdout': {
      'type': 'stdout'
    },
    'file': {
      'type': 'file',
      'filename': './logs/scan-' + timestamp + '.log'
    }
  },
  'categories': {
    'default': {
      'appenders': [ 'stdout', 'file' ],
      'level': config.logLevel
    }
  }
});

var logger = log4js.getLogger('default');

try {
  if (process.argv.length < 3) {
    throw new Error('Arguments are poor.');
  }

  var targetDpath = process.argv[2];
  if (!fs.statSync(targetDpath).isDirectory()) {
    throw new Error('Not directory path.');
  }

  var allFpaths = [];

  var walkDir = (rootDpath) => {
    logger.debug(rootDpath);

    var dpaths = [];
    var fpaths = [];
    fs.readdirSync(rootDpath).map((testPath) => {
      return path.resolve(rootDpath, testPath);
    }).forEach((testPath) => {
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        fpaths.push(testPath);
      }
    });

    Array.prototype.push.apply(allFpaths, fpaths);

    dpaths.forEach((dpath) => {
      walkDir(dpath);
    });
  };
  walkDir(path.resolve(targetDpath));

  var allCount = allFpaths.length;
  logger.info('Done loading file paths. File count: ' + allCount);

  var originCount = 0;
  var copyCount = 0;

  var originWriter = new FileWriter('./log/scan-origin-' + timestamp + '.txt');
  var copyWriter = new FileWriter('./logs/scan-copy-' + timestamp + '.txt');

  while (originCount + copyCount < allCount) {
    var aPath = allFpaths.shift();
    var aSize = fs.statSync(testFpath).size;
    var aHash = md5File.sync(aPath);

    logger.debug('check a: ' + aPath);

    for (var i = allCount - 1; 0 <= i; i--) {
      var bPath = allFpaths[i];
      logger.debug('check b:' + bPath);

      if (aSize === fs.statSync(bPath).size && aHash === md5File.sync(bPath)) {
        copyWriter.line(bPath);
        copyCount += 1;
        allFpaths.splice(i, 1);
      }
    }

    originCount += 1;
    originWriter.line(aPath);
  }

  logger.info('Origin count: ' + originCount + '/Copy count: ' + copyCount);
} catch (e) {
  logger.error(e.stack);
}
