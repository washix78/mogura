'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'extension-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {
  // node extension {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var dirPath = path.resolve(process.argv[2]);
  logger.info('Target directory path: ' + dirPath);

  var extensions = new Set();

  logger.info('Start.');

  utility.walkDir(dirPath, (fpaths) => {
    fpaths.forEach((fpath) => {
      var extension = utility.getExtension(fpath);
      if (extension !== undefined && extension !== null) {
        extensions.add(extension);
      }
    });
  });
  logger.info('Extension count: ' + extensions.size);

  var writer = utility.getFileWriter('./logs/' + id + '.txt');

  Array.from(extensions).sort().forEach((extension) => {
    writer.write(extension);
  });

  writer.finish();
  logger.info('End.');

} catch (e) {
  logger.error(e.stack);
}
