'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var md5File = require('md5-file');
var os = require('os');
var path = require('path');

var utility = require('./utility');

var id = 'timestamp-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {

  // node timestamp {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify a directory path.');
  }

  var startDpath = path.resolve(process.argv[2]);
  logger.info('Start ' + startDpath);

  var files = [];
  utility.walkDir(startDpath, (dpaths, fpaths) => {
    fpaths.forEach((fpath) => {
      var file = [];
      file.push(fpath);
      file.push(fs.statSync(fpath).birthtimeMs);
      files.push(file);
    });
  });

  files.sort((fileA, fileB) => {
    return (fileA[1] < fileB[1]) ? -1 :
      (fileA[1] === fileB[1]) ? 0 :
      1;
  });

  var writer = utility.getFileWriter('./logs/' + id + '.txt');
  files.forEach((file) => {
    var fpath = file[0];
    var timestamp = file[1];
    writer.write('#' + dateFormat(new Date(timestamp), 'yyyy-mm-dd HH:MM:ss.l'));
    writer.write(fpath);
  });

} catch (e) {
  logger.error(e.stack);
}
