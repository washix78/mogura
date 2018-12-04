'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var md5File = require('md5-file');
var path = require('path');

var utility = require('./utility');

var id = 'same-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

var isMultiple = (aSize, aHash, bPath) => {
  return (aSize === fs.statSync(bPath).size && aHash === md5File.sync(bPath));
}

try {
  // node same {file_path} {type}
  if (process.argv.length < 4 || !fs.statSync(process.argv[2]).isFile() ||
      process.argv[3] !== 'digest' || process.argv[3] !== 'name') {
    throw new Error('Please specify a file path & type.');
  }

  var srcFpath = path.resolve(process.argv[2]);
  var type = process.argv[3];

  Promise.resolve().then(() => {

    return utility.getLinesFromFile(srcFpath, (line) => {
      return !line.startsWith('#');
    });

  }).then((testPaths) => {
    logger.debug('Loaded: ' + testPaths.length);

    var writer = utility.getFileWriter('./logs/' + id + '.txt');

    var map = {};
    if ('digest' === type) {

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

      for (var size in sizeMap) {
        var list = sizeMap[size];
        if (1 < list.length) {

        } else {
          writer.write('#' + list[0]);
        }
      }

    } else if ('name' === type) {

      testPaths.forEach((fpath) => {
        var name = path.basename(fpath).toUpperCase();
        if (!(name in map)) {
          map[name] = [];
        }
        map[name].push(fpath);
      });

    }

    for (var key in map) {
      var list = map[key];
      var sameCount = list.length;
      if (1 < sameCount) {
        logger.debug('Same count: ' + sameCount + ', ' + type + ': ' + key);
      }
      list.forEach((item, idx) => {
        if (0 === idx) {
          writer.write('#' + item);
        } else {
          writer.write(item);
        }
      });
    }

    var sizeMap = {};


    {
      0: [ '' ],
      1: [ '' ],
      2: ['' ]
    }



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
