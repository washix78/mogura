const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

module.exports.getTimestamp = (srcDate) => {
  const date = (srcDate === null || srcDate === undefined) ? new Date() : srcDate;

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
  if (src === null || src === undefined) {
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

module.exports.getOptionValue = (type, values) => {
  const i = values.findIndex(val => val === type);
  if (i === -1) {
    return null;
  } else {
    for (let vi = i + 1; vi < values.length; vi++) {
      if (!values[vi].startsWith('-')) {
        return values[vi];
      }
    }
    return null;
  }
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

  dnames.sort().forEach(name => walkDir(path.resolve(topDpath, name), after));
};
module.exports.walkDir = walkDir;

module.exports.getFileWriter = (fpath) => {
  return new class {
    constructor(fpath) {
      this.ws = fs.createWriteStream(fpath).
        on('error', (err) => { throw err });
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
        this.ws.on('close', () => resolve());
      });
    }
  }(fpath);
};

module.exports.getLinesFromFile = (fpath) => {
  return new Promise((resolve, reject) => {
    if (!fs.statSync(fpath).isFile()) {
      reject();
    }

    let lines = [];
    readline.createInterface({
      input: fs.createReadStream(fpath),
    }).
      on('error', (err) => reject(err)).
      on('close', () => resolve(lines)).
      on('line', line => lines.push(line));
  });
};

module.exports.convertByte = (src) => {
  if (!/^[0-9]+(k|m|g)?$/.test(src)) {
    return null;
  }

  const num = parseInt(src.match(/[0-9]+/)[0]);
  const unit = src.match(/k|m|g/);
  if (unit && 1 <= unit.length) {
    let result = null;
    if (unit[0] === 'k') {
      result = num * 1024;
    } else if (unit[0] === 'm') {
      result = num * Math.pow(1024, 2)
    } else if (unit[0] === 'g') {
      result = num * Math.pow(1024, 3)
    }
    return result;
  } else {
    return num;
  }
};

module.exports.getFileDigest = (fpath, algorithm) => {
  return new Promise((resolve, _) => {
    const hash = crypto.createHash(algorithm);
    fs.createReadStream(fpath).
      on('data', chunk => hash.update(chunk)).
      on('close', () => resolve(hash.digest('hex')));
  });
};

module.exports.getTvsFileWriter = (fpath) => {
  return new class {
    constructor(fpath) {
      this.ws = fs.createWriteStream(fpath).
        on('error', (err) => { console.log(err); });
    }

    write(...array) {
      const dig = (subArray) => {
        for (let i = 0; i < subArray.length; i++) {
          if (0 < i) {
            this.ws.write('\t');
          }
          const elm = subArray[i];
          if (elm !== null && elm !== undefined) {
            if (typeof(elm) === 'string') {
              this.ws.write(elm);
            } else {
              this.ws.write(String(elm));
            }
          }
        }
      };
      for (let i = 0; i < array.length; i++) {
        if (0 < i) {
          this.ws.write('\t');
        }

        const elm = array[i];
        if (Array.isArray(elm)) {
          dig(elm);
        } else if (elm !== null && elm !== undefined) {
          if (typeof elm === 'string') {
            this.ws.write(elm);
          } else {
            this.ws.write(String(elm));
          }
        }
      }
      this.ws.write(os.EOL);
    }

    end() {
      return new Promise((resolve, _) => {
        this.ws.on('close', () => resolve());
        this.ws.end();
        this.ws.close();
      });
    }
  }(fpath);
};
