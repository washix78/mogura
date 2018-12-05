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
          list.forEach((item) => {
            var digest = md5File.sync(item);
            if (!(digest in map)) {
              map[digest] = [];
            }
            map[digest].push(item);
          });
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

    writer.finish();
    logger.info('End.');

  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
