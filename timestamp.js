'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');

var utility = require('./utility');

var id = 'timestamp-' + dateFormat(new Date(), 'yyyymmddHHMMssl');

var logger = utility.getLogger(id, config.logLevel);

try {

  // node timestamp {dir_path} {type: year, month, th}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify a directory path.');
  }

  var startDpath = path.resolve(process.argv[2]);

  var type = (4 <= process.argv.length) ? process.argv[3] : 'all';

  logger.info('Start ' + startDpath);

  // key is timestamp
  var fpathMap = {};

  utility.walkDir(startDpath, (dpaths, fpaths) => {
    fpaths.forEach((fpath) => {
      var timestamp = fs.statSync(fpath).birthtimeMs;
      var date = new Date(timestamp);
      var key = (type === 'year') ? dateFormat(date, 'yyyy') :
          (type === 'month') ? dateFormat(date, 'yyyy-mm') :
          (type === 'th') ? dateFormat(date, 'yyyy-mm-dd') :
          dateFormat(date, 'yyyy-mm-dd HH:MM:ss.l');
      if (!(key in fpathMap)) {
        fpathMap[key] = [];
      }
      fpathMap[key].push(fpath);
    });
  });


  var writer = utility.getFileWriter('./logs/' + id + '.txt');
  var count = 0;
  var keys = Object.keys(fpathMap).sort();
  keys.forEach((key) => {
    var fpaths = fpathMap[key];
    writer.write('# ' + key);

    fpaths.forEach((fpath) => {
      writer.write(fpath);
      count += 1;
    });
  });

  logger.info('File count: ' + count);
} catch (e) {
  logger.error(e.stack);
}
