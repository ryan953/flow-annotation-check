'use strict';

/**
 * @flow
 */

jest.mock('glob');

// $FlowFixMe need definitions for jest extensions
const glob = require.requireMock('glob');
import globsToFileList from '../globsToFileList';

describe('globsToFileList', () => {
  beforeEach(() => {
    glob.sync.mockReset();
  });

  it('should not call glob.sync() when no patterns are requested', () => {
    expect(glob.sync).not.toHaveBeenCalled();
    globsToFileList('.', [], [], {});
    expect(glob.sync).not.toHaveBeenCalled();
  });

  const fixtures = [
    {
      name: 'once',
      pattern: '*.test.js',
      calls: 1,
    },
    {
      name: 'twice',
      pattern: ['*.test.js', '*-test.js'],
      calls: 2,
    },
    {
      name: 'thrice',
      pattern: ['*.test.js', '*-test.js', '*.spec.js'],
      calls: 3,
    },
  ];
  fixtures.forEach((fixture) => {
    it(`should call glob.sync() ${fixture.name} for each include pattern`, () => {
      expect(glob.sync).not.toHaveBeenCalled();
      globsToFileList('.', fixture.pattern, [], {});
      expect(glob.sync).toHaveBeenCalledTimes(fixture.calls);
    });

    it(`should call glob.sync() ${fixture.name} for each exclude pattern`, () => {
      expect(glob.sync).not.toHaveBeenCalled();
      globsToFileList('.', [], fixture.pattern, {});
      expect(glob.sync).toHaveBeenCalledTimes(fixture.calls);
    });
  });

  it('should forward the cwd into glob.sync()', () => {
    globsToFileList('./project-dir', ['*.test.js'], [], {});

    expect(glob.sync).toHaveBeenCalledWith(
      '*.test.js', {
        cwd: './project-dir',
        cache: {},
        matchBase: true,
        absolute: true,
      },
    );
  });

  it('should merge options for glob.sync()', () => {
    const options = {
      foo: 'bar',
      matchBase: false,
    };
    globsToFileList('.', ['*.test.js'], [], options);

    expect(glob.sync).toHaveBeenCalledWith(
      '*.test.js', {
        absolute: true,
        cache: {},
        cwd: '.',
        foo: 'bar',
        matchBase: false,
      },
    );
  });

  it('should build a list of file names to include', () => {
    glob.sync = jest.fn(() => [
      'one.js',
      'two.js',
      'three.js',
    ]);
    const files = globsToFileList('.', ['*.js'], [], {});
    expect(files).toEqual([
      'one.js',
      'two.js',
      'three.js',
    ]);
  });

  it('should remove exclude files from the include list', () => {
    glob.sync.mockImplementationOnce(() => [
      'one.js',
      'two.js',
      'three.js',
    ]);
    glob.sync.mockImplementationOnce(() => [
      'two.js',
    ]);
    const files = globsToFileList('.', ['*.js'], ['two.js'], {});
    expect(files).toEqual([
      'one.js',
      'three.js',
    ]);
  });

});
