'use strict';

/**
 * @flow
 */

import type {ErrorReport, Flags, FlowStatus} from './types';

import {flatten, unique} from './core';
import {exec, execFile, stat, append, truncate} from './promisified';

const FLOW_MODE = {
  FLOW: 'flow',
  FLOW_WEAK: 'flow weak',
  NO_FLOW: 'no flow',
};

function astToFlowStatus(ast: Object): FlowStatus {
  for (let i = 0; i < 10; i++) {
    const comment = ast.comments[i];
    if (!comment) {
      return FLOW_MODE.NO_FLOW;
    }
    switch (comment.type) {
      case 'Line':
        const trimmedLine = comment.value.trim();
        if (trimmedLine == '@flow') {
          return FLOW_MODE.FLOW;
        } else if (trimmedLine == '@flow weak') {
          return FLOW_MODE.FLOW_WEAK;
        }
        break;
      case 'Block':
        const lines = comment.value.split('\n').map((line) => {
          return line.trim().replace(/^\*/, '').trim();
        });

        if (lines.includes('@flow')) {
          return FLOW_MODE.FLOW;
        } else if (lines.includes('@flow weak')) {
          return FLOW_MODE.FLOW_WEAK;
        }
        break;
      default:
        console.log('Unknown comment type', comment.type, comment);
    }
  }
  return FLOW_MODE.NO_FLOW;
}

function genCheckFlowStatus(file: string): Promise<FlowStatus> {
  const options = {};

  return exec(`flow ast ${file}`, options)
    .then(({stdout, stderr}): Object => {
      if (stderr) {
        throw new Error(stderr);
      }
      return JSON.parse(String(stdout));
    })
    .then(astToFlowStatus);
}

function genCountVisibleFiles(cwd: string): Promise<number> {
  const options = {
    maxBuffer: Infinity,
  };

  return exec(`flow ls ${cwd} | wc -l`, options)
    .then(({stdout, stderr}) => {
      if (stderr) {
        throw new Error(stderr);
      }
      return parseInt(String(stdout).trim(), 10);
    });
}

function genForceErrors(
  cwd: string,
  files: Array<string>,
  flags: Flags,
): Promise<ErrorReport> {
  const flowCheck = flags.absolute
    ? ['check', '--json', '--show-all-errors', cwd]
    : ['check', '--json', '--show-all-errors', '--strip-root', cwd]
  const options = {
    maxBuffer: Infinity,
  };
  const ERROR_STATEMENT = 'const FLOW_ANNOTATION_CHECK_INJECTED_ERROR: string = null;';

  return Promise
    .all(
      files.map(
        (file) => append(file, ERROR_STATEMENT)
      )
    )
    .then(
      () => execFile(
        'flow',
        flowCheck,
        options,
      ).catch(
        ({error, stdout, stderr}) => JSON.parse(stdout)
      )
    )
    .then(
      (checkResult) => Promise.all(
        files.map(
          (file) => truncate(file, ERROR_STATEMENT)
        )
      )
      .then(
        (_) => {
          if (checkResult.errors) {
            return unique(
              flatten(
                checkResult.errors.map((entry) => {
                  return entry.message.map((message) => message.path);
                })
              ).filter(_ => _)
            );
          }
          return [];
        }
      )
    );
}

module.exports = {
  genCheckFlowStatus,
  genCountVisibleFiles,
  genForceErrors,
};
