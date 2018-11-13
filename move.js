'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'move-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {
  // node move {dir_path} {file_path}
  if (process.argv.length < 4 ||
      !fs.statSync(process.argv[2]).isDirectory() ||
      fs.statSync(process.argv[3]).isDirectory()) {
    throw new Error('Please specify directory path & file path.');
  }

  var toDpath = path.resolve(process.argv[2]);
  var srcFpath = path.resolve(process.argv[3]);

  Promise.resolve().then(() => {

    logger.info('Get file paths:' + srcFpath);
    return utility.getLinesFromFile(srcFpath, (line) => {
      return !line.startsWith('#');
    })

  }).then((lines) => {

    var oldPaths = lines.map((line) => {
      return path.resolve(line);
    });

    var nameMap = {};
    oldPaths.forEach((oldPath) => {
      var name = path.basename(oldPath);
      if (!(name in nameMap)) {
        nameMap[name] = [];
      }
      nameMap[name].push(oldPath);
    });

    var isContinuable = true;

    for (var name in nameMap) {
      var oldPaths = nameMap[name];
      if (1 < oldPaths.length) {
        isContinuable = false;
        var errorMsg = oldPaths.reduce((str, oldPath) => {
          return str += ('\n' + oldPath);
        }, 'Same name file paths:');
        logger.error(errorMsg);
      }
    }
    if (!isContinuable) {
      throw new Error('End with error.');
    }

    var childNames = fs.readdirSync(toDpath);
    childNames.forEach((childName) => {
      if (childName in nameMap) {
        isContinuable = false;
        var errorMsg = 'Existing: ' + path.resolve(toDpath, childName) + '\n' + nameMap[childName];
        logger.error(errorMsg);
      }
    });
    if (!isContinuable) {
      throw new Error('End with error');
    }

    var successCount = 0;
    var failureCount = 0;
    oldPaths.forEach((oldPath, i) => {
      var newPath = path.resolve(toDpath, names[i]);
      try {
        fs.renameSync(oldPath, newPath);
        successCount += 1;
        logger.info(oldPath + ' -> ' + newPath);
      } catch (e) {
        failureCount += 1;
        logger.error(e.stak);
      }
    });

    logger.info('End. Success: ' + successCount + '. Failure: ' + failureCount);

  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
