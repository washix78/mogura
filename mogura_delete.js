'use strict';

var fs = require('fs');
var log4js = require('log4js');

var MoguraWriter = require('./mogura_writer');

log4js.configure('./config/log4js.json');

var log = log4js.getLogger('mogura_delete');

var MoguraDelete = function(fpaths) {

  var okWriter = new MoguraWriter();
  var ngWriter = new MoguraWriter();

  this.start = () => {
    var ok = [];
    var ng = [];

    log.info('start (' + fpaths.length + ')');

    fpaths.forEach((fpath) => {
      try {
        fs.unlinkSync(fpath);
        ok.push(fpath);
        log.debug(fpath);
      } catch (e) {
        ng.push(fpath);
        log.error(fpath);
        log.error(e.stack);
      }
    });

    if (ng.length !== 0) {
      log.error('end:ng (' + ng.length + ')');
    } else {
      log.info('end:ok (' + ok.length + ')');
    }

    okWriter.array(ok);
    ngWriter.array(ng);
  };

};

module.exports = MoguraDelete;
