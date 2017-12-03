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

function escapeShell(cmd: string): string {
  return cmd.replace(/(["\s'$`\\])/g,'\\$1');
}

function exec(
  cmd: string,
  options: child_process$execOpts,
): Promise<IOResult> {
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

function write(file: string, data: *): Promise<typeof undefined> {
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

function truncate(file: string, data: string | Buffer): Promise<void> {
  return stat(file).then((stat) => {
    const fd = fs.openSync(file, 'r+');
    fs.ftruncateSync(fd, stat.size - data.length);
  });
}

export {
  escapeShell,
  exec,
  execFile,
  stat,
  append,
  truncate,
  write,
};
