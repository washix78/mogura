'use strict';

var dateformat = require('dateformat');
var fs = require('fs');
var path = require('path');

var FileWriter = require('./file_writer');
var utils = require('./utils');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

try {
  if (process.argv.length < 3) {
    throw new Error('Arguments are poor.');
  }

  var targetDpath = process.argv[2];
  if (!fs.statSync(targetDpath)) {
    throw new Error('Not directory path.');
  }

  var set = new Set();

  var walkDir = (rootDpath) => {
    var dpaths = [];
    var fpaths = [];
    fs.readdirSync(rootDpath).map((testPath) => {
      return path.resolve(rootDpath, testPath);
    }).forEach((testPath) => {
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        fpaths.push(testPath);
      }
    });

    fpaths.forEach((fpath) => {
      var extension = utils.extension(fpath);
      if (extension !== null) {
        set.add(extension);
      }
    });

    dpaths.forEach((dpath) => {
      walkDir(dpath);
    });
  };
  walkDir(path.resolve(targetDpath));

  var extensions = Array.from(set).sort();
  var writer = new FileWriter('./logs/extension-' + timestamp + '.txt');
  extensions.forEach((extension) => {
    writer.line(extension);
  });
  writer.end();

  console.log('Extension count: ' + extensions.length);
} catch (e) {
  console.log(e.stack);
}
