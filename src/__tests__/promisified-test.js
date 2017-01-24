'use strict';

/**
 * @flow
 */

jest.mock('child_process');
jest.mock('fs');

import {exec, execFile, stat, append, truncate} from '../promisified';
const childProcess = require('child_process');
const fs = require('fs');

describe('promisified', () => {
  describe('exec', () => {
    beforeEach(() => {
      childProcess.exec.mockReset();
    });

    it('passes args through to child_process.exec', () => {
      exec('foo', {bar: 'baz'});

      expect(childProcess.exec).toHaveBeenCalledWith(
        'foo',
        {bar: 'baz'},
        expect.any(Function),
      );
    });

    it('resolves when no cli error is thrown', () => {
      const promise = exec('foo', {}).then((result) => {
        expect(result).toEqual({
          stdout: 'fizz',
          stderr: 'buzz',
        });
      });

      const callbackArg = childProcess.exec.mock.calls[0][2];
      callbackArg(null, 'fizz', 'buzz');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = exec('foo', {}).catch((result) => {
        expect(result).toEqual({
          error: 'failed',
          stdout: 'fizz',
          stderr: 'buzz',
        });
      });

      const callbackArg = childProcess.exec.mock.calls[0][2];
      callbackArg('failed', 'fizz', 'buzz');

      return promise;
    });
  });


  describe('execFile', () => {
    beforeEach(() => {
      childProcess.execFile.mockReset();
    });

    it('passes args through to child_process.execFile', () => {
      execFile('foo', ['-h'], {bar: 'baz'});

      expect(childProcess.execFile).toHaveBeenCalledWith(
        'foo',
        ['-h'],
        {bar: 'baz'},
        expect.any(Function),
      );
    });

    it('resolves when no cli error is thrown', () => {
      const promise = execFile('foo', [], {}).then((result) => {
        expect(result).toEqual({
          stdout: 'fizz',
          stderr: 'buzz',
        });
      });

      const callbackArg = childProcess.execFile.mock.calls[0][3];
      callbackArg(null, 'fizz', 'buzz');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = execFile('foo', [], {}).catch((result) => {
        expect(result).toEqual({
          error: 'failed',
          stdout: 'fizz',
          stderr: 'buzz',
        });
      });

      const callbackArg = childProcess.execFile.mock.calls[0][3];
      callbackArg('failed', 'fizz', 'buzz');

      return promise;
    });
  });

  describe('stat', () => {
    beforeEach(() => {
      fs.stat.mockReset();
    });

    it('passes args through to fs.stat', () => {
      stat('foo.js');

      expect(fs.stat).toHaveBeenCalledWith(
        'foo.js',
        expect.any(Function),
      );
    });

    it('resolves when no cli error is thrown', () => {
      const promise = stat('foo.js').then((result) => {
        expect(result).toEqual('bytes: 100');
      });

      const callbackArg = fs.stat.mock.calls[0][1];
      callbackArg(null, 'bytes: 100');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = stat('foo.js').catch((result) => {
        expect(result).toEqual('failed');
      });

      const callbackArg = fs.stat.mock.calls[0][1];
      callbackArg('failed', 'bytes: ?');

      return promise;
    });
  });

  describe('append', () => {
    beforeEach(() => {
      fs.appendFile.mockReset();
    });

    it('passes args through to fs.append', () => {
      append('foo.js', 'foo bar');

      expect(fs.appendFile).toHaveBeenCalledWith(
        'foo.js',
        'foo bar',
        expect.any(Function),
      );
    });

    it('resolves when no cli error is thrown', () => {
      const promise = append('foo.js', 'foo bar').then((result) => {
        expect(result).toBeUndefined();
      });

      const callbackArg = fs.appendFile.mock.calls[0][2];
      callbackArg(null, 'foo bar');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = append('foo.js', 'foo bar').catch((result) => {
        expect(result).toEqual('failed');
      });

      const callbackArg = fs.appendFile.mock.calls[0][2];
      callbackArg('failed', 'foo bar');

      return promise;
    });
  });

});
