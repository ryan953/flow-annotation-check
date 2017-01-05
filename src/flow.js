const {flatten, unique} = require('./core');
const {exec, execFile, stat, append, truncate} = require('./promisified');

const FLOW_MODE = {
  FLOW: 'flow',
  FLOW_WEAK: 'flow weak',
  NO_FLOW: 'no flow',
};

function astToFlowStatus(ast) {
  for (let i = 0; i < 10; i++) {
    const comment = ast.comments[i];
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
        // TODO also split on \r and \r\n
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

function checkFlowStatus(file) {
  const options = {};

  return exec(`flow ast ${file}`, options)
    .then(({stdout, stderr}) => {
      if (stderr) {
        return {};
      }

      return JSON.parse(stdout);
    })
    .then(astToFlowStatus);
}

function countVisibleFiles(cwd) {
  const options = {
    maxBuffer: Infinity,
  };

  return exec(`flow ls ${cwd} | wc -l`, options)
    .then(({stdout, stderr}) => {
      if (stderr) {
        return Infinity;
      }
      return parseInt(stdout.trim(), 10);
    });
}

function forceErrors(cwd, files, flags) {
  const flowCheck = flags.absolute
    ? ['check', '--json', '--show-all-errors', cwd]
    : ['check', '--json', '--show-all-errors', '--strip-root', cwd]
  const options = {
    maxBuffer: Infinity,
  };
  const ERROR_STATEMENT = 'const FLOW_ANNOTATION_CHECK_INJECTED_ERROR: string = null;';

  return Promise
    .all(files.map((file) => append(file, ERROR_STATEMENT)))
    .then(() =>
      execFile('flow', flowCheck, options)
        .catch(({error, stdout, stderr}) => {
          return JSON.parse(stdout);
        })
    )
    .then((checkResult) => {
      return Promise
        .all(files.map((file) => truncate(file, ERROR_STATEMENT)))
        .then((_) => {
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
        });
    });
}

module.exports = {
  checkFlowStatus,
  countVisibleFiles,
  forceErrors,
};
