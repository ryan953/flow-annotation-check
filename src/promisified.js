'use strict';

const childProcess = require('child_process');
const fs = require('fs');

function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
        return;
      }
      resolve({stdout, stderr});
    });
  });
}

function execFile(file, args, options) {
  return new Promise((resolve, reject) => {
    childProcess.execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
        return;
      }
      resolve({stdout, stderr});
    });
  });
}

function stat(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stats) => {
      if (error) {
        reject(error);
      }
      resolve(stats);
    });
  });
}

function append(file, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(file, data, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function truncate(file, data) {
  stat(file)
    .then((stat) => {
      const fd = fs.openSync(file, 'r+');
      fs.ftruncateSync(fd, stat.size - data.length);
    });
}

module.exports = {
  exec,
  execFile,
  stat,
  append,
  truncate,
};
