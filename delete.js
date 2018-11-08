'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'delete-' + dateFormat(new Date(), 'yyyymmddHHMMssl');
var logger = utility.getLogger(id, config.logLevel);

try {
  // node delete fpath
  if (process.argv.length < 3 || fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify a file path.');
  }

  var listFpath = path.resolve(process.argv[2]);
  logger.info('Load from "' + listFpath + '".');

  Promise.resolve().then(() => {

    return utility.getLinesFromFile(listFpath, (line) => {
      return !line.startsWith('#');
    });

  }).then((fpaths) => {

    logger.info('Target file count: ' + fpaths.length);
    var deletedCount = 0;
    fpaths.forEach((fpath) => {
      try {
        fs.unlinkSync(fpath);
        logger.info('Deleted "' + fpath + '".');
        deletedCount += 1;
      } catch (err) {
        logger.error(err.stack);
      }
    });
    logger.info('End. Deleted file count: ' + deletedCount);

  }).catch((err) => {

    logger.error(err.stack);

  });
} catch (e) {
  logger.error(e.stack);
}
