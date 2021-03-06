'use strict';

/**
 * @flow
 */

import type {ErrorReport, Flags, FlowStatus} from './types';
import type {IOResult} from './promisified';

import {unique} from './core';
import {execFile, read, append, truncate} from './promisified';
import {parse} from 'babel-eslint';

type ASTPosition = {
  line: number,
  column: number,
};
type ASTToken = {
  type: 'String' | 'Punctuator' | string,
  value: string,
  start: number,
  end: number,
  loc: Array<{
    start: ASTPosition,
    end: ASTPosition,
  }>,
  range: [number, number],
};
type ASTComment = {
  type: 'Line' | 'Block' | string,
  value: string,
  start: number,
  end: number,
  loc: Array<{
    start: ASTPosition,
    end: ASTPosition,
  }>,
  range: [number, number],
};
type AST = {
  comments: Array<ASTComment>,
  tokens: Array<ASTToken>,
};

type FlowCheckErrorMessage = {
  path: string,
};
type FlowCheckError = {
  kind: string,
  level: string,
  message: Array<FlowCheckErrorMessage>,
};
type FlowCheckResult = {
  errors?: Array<FlowCheckError>,
};

const FLOW_MODE = {
  FLOW_STRICT: 'flow strict',
  FLOW_STRICT_LOCAL: 'flow strict-local',
  FLOW: 'flow',
  FLOW_WEAK: 'flow weak',
  NO_FLOW: 'no flow',
};

function statusFromLines(lines: Array<string>): ?FlowStatus {
  for (let i = 0, len = lines.length; i < len; i += 1) {
    const words = lines[i].trim().split(' ');
    const nextPosition = words.indexOf('@flow') + 1;
    const nextWord = words[nextPosition];
    if (nextWord === 'strict') {
      return FLOW_MODE.FLOW_STRICT;
    } else if (nextWord === 'strict-local') {
      return FLOW_MODE.FLOW_STRICT_LOCAL;
    } else if (nextWord === 'weak') {
      return FLOW_MODE.FLOW_WEAK;
    } else if (nextPosition) {
      return FLOW_MODE.FLOW;
    }
  }
  return null;
}

function getFirstToken(ast: AST): null | ASTToken {
  for (const token of ast.tokens) {
    const isString = token.type === 'String';
    const isSemicolon = token.type === 'Punctuator' && token.value === ';';
    if (!isString && !isSemicolon) {
      return token;
    }
  }
  return null;
}

function astToFlowStatus(ast: AST): FlowStatus {
  const firstToken = getFirstToken(ast);

  for (let i = 0; i < 10; i++) {
    const comment = ast.comments[i];
    if (!comment) {
      return FLOW_MODE.NO_FLOW;
    }

    if (firstToken && firstToken.start < comment.start) {
      return FLOW_MODE.NO_FLOW;
    }

    switch (comment.type) {
      case 'Line': {
        const status = statusFromLines([comment.value.trim()]);
        if (status) {
          return status;
        }
        break;
      }
      case 'Block': {
        const status = statusFromLines(
          comment.value.split('\n')
            .map((line) => line.trim().replace(/^\*/, '').trim())
            .filter(Boolean)
        );
        if (status) {
          return status;
        }
        break;
      }
      default:
        throw new Error(`Unknown comment type ${comment.type} for comment ${JSON.stringify(comment)}`);
    }
  }
  return FLOW_MODE.NO_FLOW;
}

function genCheckFlowStatus(
  _: string,
  file: string,
): Promise<FlowStatus> {
  return read(file)
    .then((data) => parse(data))
    .then(astToFlowStatus);
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

  return Promise.resolve(
    Promise.all(files.map((file) => append(file, ERROR_STATEMENT)))
      .then(() =>
        execFile(flags.flow_path, flowCheck, options)
          .then(({stdout, stderr}: IOResult) => JSON.parse(String(stdout)))
          .catch(({error, stdout, stderr}: IOResult) => {
            try {
              return JSON.parse(String(stdout));
            } catch (e) {
              return {};
            }
          })
      )
      .then((checkResult: FlowCheckResult) =>
        Promise.all(files.map((file) => truncate(file, ERROR_STATEMENT)))
        .then((_): ErrorReport => {
          return unique(
            (checkResult.errors || [])
              .reduce((paths, checkError) =>
                paths.concat(
                  checkError.message
                    .filter((message) => message.path)
                    .reduce((paths, message) => paths.concat(message.path), [])
                ), [])
          );
        })
      )
  );
}

export {
  genCheckFlowStatus,
  genForceErrors,
};
