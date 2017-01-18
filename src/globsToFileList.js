'use strict';

/**
 * @flow
 */

const glob = require('glob');
const {flatten, toArray} = require('./core');

type GlobOptions = {
  absolute: boolean,
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
  const includeFiles = coalescePatterns(toArray(includePatterns), globOptions);
  const excludeFiles = coalescePatterns(toArray(excludePatterns), globOptions);

  return includeFiles.filter((file) => !excludeFiles.includes(file));
}

module.exports = globsToFileList;
