'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'list-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

var getName = (fpath) => {
  return path.basename(fpath);
};

try {
  // node list {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var startDirPath = path.resolve(process.argv[2]);
  logger.info('Start ' + startDirPath);

  var extension = null;
  var name = null;
  var extensions = [];
  var names = [];

  var fpathsFilter = null;
  // node list {dir_path} -{e_or_n_or_-eg_or_-ng} {extension_or_name}
  if (5 <= process.argv.length) {
    switch (process.argv[3]) {
    case '-e':
      extension = process.argv[4];
      logger.info('List by a extension "' + extension + '".');
      fpathsFilter = (fpath) => {
        return extension === utility.getExtension(fpath);
      };
      break;
    case '-n':
      name = process.argv[4];
      logger.info('List by a name "' + name + '".');
      fpathsFilter = (fpath) => {
        return name === getName(fpath);
      };
      break;
    case '-eg':
      extensions = config.list.extensions[process.argv[4]];
      logger.info('List by extension group "' + process.argv[4] + '".');
      fpathsFilter = (fpath) => {
        return 0 <= extensions.indexOf(utility.getExtension(fpath));
      };
      break;
    case '-ng':
      names = config.list.names[process.argv[4]];
      logger.info('List by name group "' + process.argv[4] + '".');
      fpathsFilter = (fpath) => {
        return 0 <= names.indexOf(getName(fpath));
      };
      break;
    }
  } else {
    logger.info('List all.');
  }

  var fileCount = 0;
  var writer = utility.getFileWriter('./logs/' + id + '.txt');

  utility.walkDir(startDirPath, (fpaths) => {
    fileCount += fpaths.length;
    if (fpathsFilter) {
      fpaths.filter(
        fpathsFilter
      ).forEach((fpath) => {
        writer.write(fpath);
      });
    } else {
      fpaths.forEach((fpath) => {
        writer.write(fpath);
      });
    }
  });

  writer.finish();
  logger.info('End. File count: ' + fileCount);

} catch (e) {
  logger.error(e.stack);
}
