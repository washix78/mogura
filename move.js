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

    return utility.getLinesFromFile(srcFpath, (line) => {
      return !line.startsWith('#');
    })

  }).then((lines) => {

    var oldPaths = lines.map((line) => {
      return path.resolve(line);
    });
    var names = oldPaths.map((oldPath) => {
      return path.basename(oldPath);
    });

    // check targets
    var duplicates = {};
    names.forEach((name1, i1) => {
      var idxes = [];
      names.forEach((name2, i2) => {
        if (i1 !== i2 && name1 === name2) {
          idxes.push(i2);
        }
      });
      if (0 < idxes.length) {
        duplicates[i1] = idxes;
      }
    });
    if (0 < Object.keys(duplicates).length) {
      for (var i in duplicates) {
        var idxes = duplicates[i];
        var errorMsg = idxes.reduce((str, idx) => {
          return str += ('\n' + oldPaths[idx]);
        }, 'Same name file paths:\n' + oldPaths[i]);
        logger.error(errorMsg);
      }
      throw new Error('End with error.');
    }

    // check directory children
    var childNames = fs.readdirSync(toDpath);
    var natives = {};
    childNames.forEach((childName) => {
      var idx = names.indexOf(childName);
      if (-1 < idx) {
        var childPath = path.resolve(toDpath, childName);
        natives[childPath] = oldPaths[idx];
      }
    });
    if (0 < Object.keys(natives).length) {
      for (var childPath in natives) {
        logger.error('Existing "' + childPath + '"\n' + natives[childPath]);
      }
    }


  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
