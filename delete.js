'use strict';

var dateformat = require('dateformat');
var fs = require('fs');
var readline = require('readline');

var FileWriter = require('./file_writer');
var utils = require('./utils');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

var logger = utils.logger('delete', timestamp);

try {
  if (process.argv.length < 3) {
    throw new Error('Arguments are poor.');
  }

  var listFpath = process.argv[2];
  if (fs.statSync(listFpath).isDirectory()) {
    throw new Error('Not file path');
  }

  var okWriter = new FileWriter('./logs/delete-success-' + timestamp + '.txt');
  var ngWriter = new FileWriter('./logs/delete-failure-' + timestamp + '.txt');

  var deletedCount = 0;
  var allCount = 0;

  readline.createInterface({
    input: fs.createReadStream(listFpath),
    crlfDelay: Infinity
  }).on('line', (deleteFpath) => {
    allCount += 1;
    try {
      fs.unlinkSync(deleteFpath);
      deletedCount += 1;
      okWriter.list(deleteFpath);
    } catch (failure) {
      logger.error(failure.stack);
      ngWriter.list(deleteFpath);
    }
  }).on('close', () => {
    logger.info('Deleted count: ' + deletedCount + '/' + allCount);
    okWriter.end();
    ngWriter.end();
  }).on('error', (err) => {
    throw err;
  })
} catch (e) {
  logger.error(e.stack);
}
