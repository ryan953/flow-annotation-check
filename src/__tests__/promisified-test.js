'use strict';

/**
 * @flow
 */

jest.mock('child_process');
jest.mock('fs');

import {
  append,
  asyncMap,
  execFile,
  stat,
  truncate,
  read,
  write,
} from '../promisified';
const childProcess = require('child_process');
const fs = require('fs');

function _mock(mockFn) {
  // $FlowExpectedError: escape hatch to silence _mockflow
  return (mockFn: any);
}

describe('promisified', () => {
  describe('execFile', () => {
    beforeEach(() => {
      _mock(childProcess.execFile).mockReset();
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

      const callbackArg = _mock(childProcess.execFile).mock.calls[0][3];
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

      const callbackArg = _mock(childProcess.execFile).mock.calls[0][3];
      callbackArg('failed', 'fizz', 'buzz');

      return promise;
    });
  });

  describe('stat', () => {
    beforeEach(() => {
      _mock(fs.stat).mockReset();
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

      const callbackArg = _mock(fs.stat).mock.calls[0][1];
      callbackArg(null, 'bytes: 100');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = stat('foo.js').catch((result) => {
        expect(result).toEqual('failed');
      });

      const callbackArg = _mock(fs.stat).mock.calls[0][1];
      callbackArg('failed', 'bytes: ?');

      return promise;
    });
  });

  describe('read', () => {
    beforeEach(() => {
      _mock(fs.readFile).mockReset();
    });

    it('passes args through to fs.readFile', () => {
      read('foo.js');

      expect(fs.readFile).toHaveBeenCalledWith(
        'foo.js',
        'utf8',
        expect.any(Function),
      );
    });
  });

  describe('write', () => {
    beforeEach(() => {
      _mock(fs.writeFile).mockReset();
    });

    it('passes args through to fs.writeFile', () => {
      write('foo.js', 'foo bar');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'foo.js',
        'foo bar',
        expect.any(Function),
      );
    });

    it('resolves when no cli error is thrown', () => {
      const promise = write('foo.js', 'foo bar').then((result) => {
        expect(result).toBeUndefined();
      });

      const callbackArg = _mock(fs.writeFile).mock.calls[0][2];
      callbackArg(null, 'foo bar');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = write('foo.js', 'foo bar').catch((result) => {
        expect(result).toEqual('failed');
      });

      const callbackArg = _mock(fs.writeFile).mock.calls[0][2];
      callbackArg('failed', 'foo bar');

      return promise;
    });
  });

  describe('append', () => {
    beforeEach(() => {
      _mock(fs.appendFile).mockReset();
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

      const callbackArg = _mock(fs.appendFile).mock.calls[0][2];
      callbackArg(null, 'foo bar');

      return promise;
    });

    it('throws when a cli error happens', () => {
      const promise = append('foo.js', 'foo bar').catch((result) => {
        expect(result).toEqual('failed');
      });

      const callbackArg = _mock(fs.appendFile).mock.calls[0][2];
      callbackArg('failed', 'foo bar');

      return promise;
    });
  });

  describe('asyncMap', () => {
    it('should map a list of things to promises', () => {
      return expect(asyncMap(
        [1, 2, 3],
        (num) => Promise.resolve(num * 2)
      )).resolves.toEqual([2, 4, 6]);
    });

    it('should return any rejections', () => {
      return expect(asyncMap(
        [true, false, true],
        (b) => b ? Promise.resolve(true) : Promise.reject(false)
      )).rejects.toEqual(false);
    });
  });

});
