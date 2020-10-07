const fs = require('fs');
const os = require('os');
const { resolve } = require('path');
const path = require('path');

module.exports.getTimestamp = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, 0);
  const d = date.getDate().toString().padStart(2, 0);
  const h = date.getHours().toString().padStart(2, 0);
  const min = date.getMinutes().toString().padStart(2, 0);
  const s = date.getSeconds().toString().padStart(2, 0);
  const ms = date.getMilliseconds().toString().padStart(3, 0);
  const timestamp = `${y}${m}${d}${h}${min}${s}${ms}`;
  return timestamp;
};

module.exports.getExtension = (src) => {
  if (!src) {
    return null;
  }

  const dotI = src.lastIndexOf('.');
  if (dotI < 0) {
    return null;
  }

  if (dotI + 1 === src.length) {
    return '';
  }

  return src.substring(dotI + 1);
};

module.exports.getOptionValues = (type, values) => {
  const i = values.findIndex(val => val === type);
  if (i === -1) {
    return null;
  } else {
    let optValues = [];
    for (let vi = i + 1; vi < values.length; vi++) {
      if (!values[vi].startsWith('-')) {
        optValues.push(values[vi]);
      }
    }
    return optValues;
  }
};

const walkDir = (topDpath, after) => {
  const names = fs.readdirSync(topDpath);
  let dnames = [];
  let fnames = [];
  names.forEach(name => {
    if (fs.statSync(path.resolve(topDpath, name)).isDirectory()) {
      dnames.push(name);
    } else {
      fnames.push(name);
    }
  });

  if (after) {
    after(topDpath, fnames);
  }

  dnames.forEach(name => walkDir(path.resolve(topDpath, name), after));
};
module.exports.walkDir = walkDir;

module.exports.getFileWriter = (fpath) => {
  return new class {
    constructor(fpath) {
      this.ws = fs.createWriteStream(fpath).on('error', (err) => { throw err });
    }

    write(lines) {
      if (Array.isArray(lines)) {
        lines.forEach(line => {
          this.ws.write(line);
          this.ws.write(os.EOL);
        });
      } else {
        this.ws.write(lines);
        this.ws.write(os.EOL);
      }
    }

    end() {
      return new Promise((resolve, _) => {
        this.ws.end();
        this.ws.close();
        this.ws.on('close', () => {
          resolve();
        });
      });
    }
  }(fpath);
};
