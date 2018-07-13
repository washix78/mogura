'use strict';

var config = require('config');
var fs = require('fs');
var log4js = require('log4js');
var readline = require('readline');

var MoguraList = require('./mogura_list');
var MoguraDelete = require('./mogura_delete');

log4js.configure('./config/log4js.json');
var log = log4js.getLogger('');

try {
  // node mogura ${path} ${type} ${options}
  if (process.argv.length < 4) {
    throw new Error('Please specify arguments.');
  }

  var path = process.argv[2];

  var type = process.argv[3];
  if ([ 'list', 'name', 'extension', 'delete' ].indexOf(type) === -1) {
    throw new Error('Not supported.');
  }

  switch (type) {
    case 'list':
      if (!fs.statSync(path).isDirectory()) {
        throw new Error('Not directory.');
      }

      var listOptions = {};
      var listType = (6 <= process.argv.length) ? process.argv[4] : null;
      if (listType === '-n') {
        listOptions.type = 'names';
        listOptions.names = [ process.argv[5] ];
      } else if (listType === '-e') {
        listOptions.type = 'extensions';
        listOptions.extensions = [ process.argv[5] ];
      } else if (listType === '-ng') {
        listOptions.type = 'names';
        listOptions.names = config.list.names[process.argv[5]];
      } else if (listType === '-eg') {
        listOptions.type = 'extensions';
        listOptions.extensions = config.list.extensions[process.argv[5]];
      } else {
        listOptions.type = 'all';
      }

      var moguraList = new MoguraList(path, options).result();
      // TODO write
    case 'name':
      var dpath = process.argv[3];
      if (!fs.statSync(dpath).isDirectory()) {
        throw new Error('Not directory.');
      }

    case 'extension':
      var dpath = process.argv[3];
      if (!fs.statSync(dpath).isDirectory()) {
        throw new Error('Not directory.');
      }
      break;

    case 'delete':
      var fpath = process.argv[3];
      if (fs.statSync(fpath).isDirectory()) {
        throw new Error('Not file.');
      }
      new MoguraDelete(fpath);
      break;
  }

} catch (e) {
  log.error(e);
}
