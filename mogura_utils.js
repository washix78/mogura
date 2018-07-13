'use strict';

var MoguraUtils = {};

MoguraUtils.getExtension = (name) => {
  var i = name.lastIndexOf('.');
  var extension = (i !== -1) ? name.substr(i + 1) : null;
  return extension;
};

module.exports = MoguraUtils;
