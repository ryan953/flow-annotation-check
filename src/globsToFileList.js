'use strict';

/**
 * @flow
 */


import glob from 'glob';
import {flatten} from './core';

type GlobOptions = {
  absolute?: boolean,
};

function coalescePatterns(
  patterns: Array<string>,
  globOptions: GlobOptions,
): Array<string> {
  return flatten(
    patterns.map((pattern) => glob.sync(pattern, globOptions))
  );
}

function globsToFileList(
  cwd: string,
  includePatterns: Array<string>,
  excludePatterns: Array<string>,
  options: GlobOptions,
): Array<string> {
  const globOptions = Object.assign({}, {
    cwd: cwd,
    cache: {},
    matchBase: true,
    absolute: true,
  }, options);
  const includeFiles = coalescePatterns((includePatterns), globOptions);
  const excludeFiles = coalescePatterns((excludePatterns), globOptions);

  return includeFiles.filter((file) => excludeFiles.indexOf(file) < 0);
}

export default globsToFileList;
