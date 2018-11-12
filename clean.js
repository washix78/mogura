'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'clean-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {
  // node clean {directory_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var startDirPath = path.resolve(process.argv[2]);
  logger.info('Start ' + startDirPath);

  utility.walkDir(startDirPath, null, (dpaths, fpaths) => {
    dpaths.forEach((dpath) => {
      var children = fs.readdirSync(dpath);
      if (0 === children.length) {
        try {
          fs.rmdirSync(dpath);
          logger.info('Deleted: ' + dpath);
        } catch (e) {
          logger.error('Could not delete: ' + dpath);
          logger.error(e.stack);
        }
      }
    });
  });

  logger.info('End');

} catch (e) {
  logger.error(e.stack);
}
