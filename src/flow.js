const childProcess = require('child_process');
const fs = require('fs');
const glob = require('glob');

const FLOW_MODE = {
  FLOW: 'flow',
  FLOW_WEAK: 'flow weak',
  NO_FLOW: 'no flow',
};

function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
        return;
      }
      resolve({stdout, stderr});
    });
  });
}

function execFile(file, args, options) {
  return new Promise((resolve, reject) => {
    childProcess.execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr});
        return;
      }
      resolve({stdout, stderr});
    });
  });
}

function stat(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stats) => {
      if (error) {
        reject(error);
      }
      resolve(stats);
    });
  });
}

function append(file, data, options) {
  return new Promise((resolve, reject) => {
    fs.appendFile(file, data, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function remove(file, data, options) {
  stat(file)
    .then((stat) => {
      const fd = fs.openSync(file, 'r+');
      fs.ftruncateSync(fd, stat.size - data.length);
    });
}

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

function checkFlowStatus(cwd, file) {
  const options = {};
  return exec(`flow ast ${file}`, options)
    .then(({stdout, stderr}) => {
      if (stderr) {
        console.log('Error', stderr);
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
        console.log('Error', stderr);
        return Infinity;
      }
      return parseInt(stdout.trim(), 10);
    });
}

function flatten(arrays) {
  return [].concat.apply([], arrays);
}

function unique(array) {
  const obj = {};
  array.forEach((item) => { obj[item] = true; });
  return Object.keys(obj);
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
        .all(files.map((file) => remove(file, ERROR_STATEMENT)))
        .then((_) => {
          return unique(
            flatten(
              checkResult.errors.map((entry) => {
                return entry.message.map((message) => message.path);
              })
            ).filter(_ => _)
          );
        });
    });
}

module.exports = {
  checkFlowStatus,
  countVisibleFiles,
  forceErrors,
};
