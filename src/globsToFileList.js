const glob = require('glob');
const {flatten, toArray} = require('./utils');

function coalescePatterns(patterns, globOptions) {
  return flatten(
    patterns.map((pattern) => glob.sync(pattern, globOptions))
  );
}

function globsToFileList(
  cwd,
  includePatterns,
  excludePatterns,
  options
) {
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
