'use strict';

/**
 * @flow
 */

import childProcess from 'child_process';
import fs from 'fs';

export type IOResult = {
  stdout: string | Buffer,
  stderr: string | Buffer,
  error?: Error,
};

function execFile(
  file: string,
  args: Array<string>,
  options: child_process$execFileOpts,
): Promise<IOResult> {
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

function read(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function write(file: string, data: Buffer | string): Promise<typeof undefined> {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function append(file: string, data: Buffer | string): Promise<typeof undefined> {
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

function truncate(file: string, data: string | Buffer): Promise<void> {
  return stat(file).then((stat) => {
    const fd = fs.openSync(file, 'r+');
    fs.ftruncateSync(fd, stat.size - data.length);
  });
}

function asyncMap<I, T>(
  items: Array<I>,
  mapper: (item: I) => Promise<T>,
): Promise<Array<T>> {
  return items.reduce((prom, item) => {
    return prom.then((arr) => {
      return Promise.resolve(mapper(item)).then((result) => {
        arr.push(result);
        return arr;
      })
    });
  }, Promise.resolve([]));
}

export {
  asyncMap,
  execFile,
  stat,
  append,
  truncate,
  read,
  write,
};
