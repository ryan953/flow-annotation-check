'use strict';

/**
 * @flow
 */

import childProcess from 'child_process';
import fs from 'fs';

type IO = {
  stdout: string | Buffer,
  stderr: string | Buffer,
};

function exec(
  cmd: string,
  options: Object,
): Promise<IO> {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}

function execFile(
  file: string,
  args: Array<string>,
  options: Object,
): Promise<IO> {
  return new Promise((resolve, reject) => {
    childProcess.execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}

function stat(file: string): Promise<{size: number}> {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });
}

function append(file: string, data: *): Promise<typeof undefined> {
  return new Promise((resolve, reject) => {
    fs.appendFile(file, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function truncate(file: string, data: string | Buffer): void {
  stat(file).then((stat) => {
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
