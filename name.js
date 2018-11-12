'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'name-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {
  // node name {directory_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var dirPath = path.resolve(process.argv[2]);
  logger.info('Target directoru path: ' + dirPath);

  var names = new Set();

  utility.walkDir(dirPath, (dpaths, fpaths) => {
    fpaths.forEach((fpath) => {
      if (utility.getExtension(fpath) === null) {
        names.add(path.basename(fpath));
      }
    });
  });

  var writer = utility.getFileWriter('./logs/' + id + '.txt');

  Array.from(names).sort().forEach((name) => {
    writer.write(name);
  });

  writer.finish();
  logger.info('End. Name count: ' + names.size);

} catch (e) {
  logger.error(e.stack);
}
