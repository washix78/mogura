'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var os = require('os');
var path = require('path');

var utility = require('./utility');

var id = 'move-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

var isMovable = (map) => {
  for (var key in map) {
    var list = map[key];
    if (1 < list.length) {
      return false;
    } else {
      continue;
    }
  }
  return true;
};

try {
  // node move {dir_path} {file_path}
  if (!(4 <= process.argv.length &&
      fs.statSync(process.argv[2]).isDirectory() &&
      fs.statSync(process.argv[3]).isFile())) {
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

    // read from directory (existing)
    var nameMap = {};
    fs.readdirSync(toDpath).forEach((name) => {
      var key = name.toUpperCase();
      nameMap[key] = [ path.resolve(toDpath, name) ];
    });

    var beforePaths = lines.map((line) => {
      return path.resolve(line);
    }).filter((testPath) => {
      // exist
      var exists = fs.existsSync(testPath);
      if (!exists) {
        logger.error('Not exist: ' + testPath);
      }
      return exists;
    }).filter((testPath) => {
      var isFile = fs.statSync(testPath).isFile();
      if (!isFile) {
        logger.error('Directory: ' + testPath);
      }
      return isFile;
    }).filter((testPath) => {
      // exclude self
      var key = path.basename(testPath).toUpperCase();
      var isSelf = key in nameMap && nameMap[key][0] === testPath;
      if (isSelf) {
        logger.debug('Self: ' + testPath);
      }
      return !isSelf;
    });

    beforePaths.forEach((testPath) => {
      var key = path.basename(testPath).toUpperCase();
      if (!(key in nameMap)) {
        nameMap[key] = [];
      }
      nameMap[key].push(testPath);
    });

    if (isMovable(nameMap)) {
      logger.info('Move.');

      var afterPaths = beforePaths.map((beforePath) => {
        return path.resolve(toDpath, path.basename(beforePath));
      });

      for (var i = 0; i < beforePaths.length; i++) {
        var before = beforePaths[i];
        var after = afterPaths[i];
        try {
          fs.renameSync(before, after);
          logger.debug(before + ' -> ' + after);
        } catch(e) {
          logger.error(e.stack + os.EOL + before + ' -> ' + after);
        }
      }
    } else {
      logger.error('Same name files exists.');

      var writer = utility.getFileWriter('./logs/' + id + '.txt');
      for (var key in nameMap) {
        var list = nameMap[key];
        list.forEach((fpath, i) => {
          if (0 === i) {
            writer.write('#' + fpath);
          } else {
            writer.write(fpath);
          }
        });
      }
    }

  }).catch((err) => {

    logger.error(err.stack);

  }).finally(() => {
    logger.info('End');
  });
} catch (e) {
  logger.error(e.stack);
}
