'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var os = require('os');
var path = require('path');

var utility = require('./utility');

var id = 'rename-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {
  // node rename {before_file_path} {after_file_path}
  if (!(
      4 <= process.argv.length &&
      fs.statSync(process.argv[2]).isFile() &&
      fs.statSync(process.argv[3]).isFile())
   ) {

    throw new Error('Please specify 2 file path.');
  }

  var beforeSrcFpath = path.resolve(process.argv[2]);
  var afterSrcFpath = path.resolve(process.argv[3]);

  var beforeFpaths = null;
  var afterFpaths = null;

  Promise.resolve().then(() => {
    logger.debug('Before from: ' + beforeSrcFpath);

    return utility.getLinesFromFile(beforeSrcFpath, (line) => {
      return !line.startsWith('#');
    });

  }).then((lines) => {
    beforeFpaths = lines;

    logger.debug('After from: ' + afterSrcFpath);

    return utility.getLinesFromFile(afterSrcFpath, (line) => {
      return !line.startsWith('#');
    });

  }).then((lines) => {
    afterFpaths = lines;

    if (beforeFpaths.length !== afterFpaths.length) {
      throw new Error('Item count is not same. Before: ' +
        beforeFpaths.length + ', after: ' + afterFpaths.length + '.');
    }

    for (var i = 0, lineI = 1; i < beforeFpaths.length; i++, lineI++) {
      var beforeFpath = beforeFpaths[i];
      var afterFpath = afterFpaths[i];

      if (!fs.existsSync(beforeFpath)) {
        logger.error('Not exist: ' + lineI);
      } else  if (!fs.statSync(beforeFpath).isFile()) {
        logger.error('Not file: ' + lineI);
      } else if (!(path.dirname(beforeFpath).toLowerCase() === path.dirname(afterFpath).toLowerCase())) {
        logger.error('Not same parent directory: ' + lineI);
      } else if (fs.existsSync(afterFpath)) {
        logger.error('Exist: ' + lineI);
      } else {
        // OK
        try {
          fs.renameSync(beforeFpath, afterFpath);
          logger.debug(beforeFpath + ' -> ' + afterFpath);
        } catch (e) {
          logger.error(lineI + os.EOL + e.stack);
        }
      }
    }
  }).catch((err) => {

    logger.error(err.stack);

  }).finally(() => {

    logger.info('End.');

  });
} catch (e) {
  logger.error(e.stack);
}
