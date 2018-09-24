# flow-annotation-check

[![Current Version](https://img.shields.io/npm/v/flow-annotation-check.svg)](https://www.npmjs.com/package/flow-annotation-check)

![node](https://img.shields.io/node/v/flow-annotation-check.svg) [![Build Status](https://travis-ci.org/ryan953/flow-annotation-check.svg?branch=master)](https://travis-ci.org/ryan953/flow-annotation-check) [![codecov](https://codecov.io/gh/ryan953/flow-annotation-check/branch/master/graph/badge.svg)](https://codecov.io/gh/ryan953/flow-annotation-check)
 [![Greenkeeper badge](https://badges.greenkeeper.io/ryan953/flow-annotation-check.svg)](https://greenkeeper.io/)

Verify the `@flow`, `@flow strict`, `@flow strict-local` and `@flow weak` annotations in your javascript files.

Install with Yarn or NPM to include in your project:

```bash
yarn add --dev flow-annotation-check
# or
npm install --save-dev flow-annotation-check
```

or use `npx` to easily run the cli commands:

```bash
npx flow-annotation-check ~/path/to/project
```

## As a library

Once installed you can import `flow-annotation-check` into your own module and have the checker return a list of files for you to further process.

```javascript
import genReport, {genCheckFlowStatus, genValidate} from 'flow-annotation-check';
```

The most useful public methods are:

- `genReport(folder: string, config: Config): Promise<Array<FileReport>>`
- `genCheckFlowStatus(flowPath: string, filePath: string): Promise<FlowStatus>`

The types involved are:

```javascript
type Glob = string; // See https://github.com/isaacs/node-glob

type Config = {
  include: Array<Glob>,
  exclude: Array<Glob>,
  absolute: boolean,
};

type FlowStatus = 'flow' | 'flow strict' | 'flow strict-local' | 'flow weak' | 'no flow';

type FileReport = {
  file: string,
  status: FlowStatus,
};
```

#### genReport(folder, config)

If you want to check a whole project at once, then call `genReport`. You can pass in the root folder, like `~/my-project/src` and then a configuration object with some glob strings to find your files. `genReport` will return a Promise that will resolve when all matching files have had their flow-status discovered.

This is a convenience method to make working with globs and mapping over `genCheckFlowStatus` easier. Each file is tested serially in order to avoid setting really long timeouts that lock up the flow server.

```javascript
import genReport from 'flow-annotation-check';

genReport(
  '~/path/to/project',
  {
    include: ['**/*.js'],
    exclude: ['**/*.coffee'],
    absolute: true,
  }
).then((entries) => {
  entries.forEach((entry) => {
    console.log(entry.status + "\t" + entry.file);
  });
});
```

#### genCheckFlowStatus(flowPath, filePath)

If you're checking one file at a time then go ahead and call `genCheckFlowStatus` directly. This takes a string that will be passed directly into the `flow` binary you specify. If flow is installed in your project, or on your system path then pass `'flow'` as the first argument.

```javascript
import {genCheckFlowStatus} from 'flow-annotation-check';

const file = '~/path/to/project/src/main.js';
genCheckFlowStatus('flow', file).then((status) => {
  console.log(`The status of ${file} is ${status}`);
});
```

## CLI

You can use [`npx`](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) to run `flow-annotation-check` against your codebase in the terminal. It's as simple as:

```
npx flow-annotation-check ~/path/to/project
```

The available commands and flags can be found by running `flow-annotation-check -h` or from the example above: `npm run annotations -- --help`. Click through to read the [latest help output](https://github.com/ryan953/flow-annotation-check/blob/master/src/__tests__/__snapshots__/parser-test.js.snap) on master.

The common settings you will use are:

* `-i`, `--include`  Glob for files to include. Can be set multiple times.
* `-x`, `--exclude`  Glob for files to exclude. Can be set multiple times.
* `-a`, `--absolute` Report absolute path names. The default is to report only filenames.
* `-o`, `--output`   Choose from either `text`, `csv`, `junit`, or `html` format.
* `--show-summary`   Include a summary of the data in the `--output` stream, does not apply to `junit` format.

Setting `--exclude` will override the defaults. So don't forget to ignore `node_modules/**/*.js` in addition to project specific folders.

You can also configure cli arguments directly inside your package.json file. Example:

```json
{
  "dependencies": {
    "flow-annotation-check": "^1.0.0"
  },
  "flow-annotation-check": {
    "absolute": false,
    "allow_weak": false,
    "exclude": ["+(node_modules|build|flow-typed)/**/*.js"],
    "flow_path": "flow",
    "include": ["**/*.js"],
    "output": "text",
    "list_files": "all",
    "root": "."
  }
}
```

### Output format

You can use the `--output` flag, or `-o` to set the output format of the report. All reports are printed to stdio using console.log. The `--output` flag has no affect when `--validate` is set.

The default format is `text` which prints a two column list of status value (one of `flow`, `flow weak` or `no flow`) and filename separated by the Tab character.

The `csv` option prints a two column list of status value and filename with each field wrapped in quotes and separated by `,`.

The `junit` option prints an xml report suitable to be consumed by CI tools like Jenkins.

The `html-table` option prints an opening and closing `<table>` tag with two columns of data. Each row contains a `data-status` attribute which can be useful for styling. There is a summary of the rows inside the `<tfoot>` element. This does not print a full, valid, html page but it is possible to render it directly. This option, with some custom CSS, could be used as part of a dashboard where only the names of the non-flow files are listed.

In addition to the `--output` flag there are other flags that will return the report in different formats and save it directly to a file for you. You can set `--html-file`, `--csv-file`, `--junit-file` or `--summary-file` and each one will create a file containing the respective report. This is useful for getting the report in multiple formats at the same time. Try them all at once!

For example, it is desirable for CI logs to not have any extra markup and use the default `text` format with the `-o` flag. But at the same time possible to use the `--junit-file` flag to feed some data into jenkins for tracking over time.


### VERBOSE

If the `VERBOSE` env variable is set to a truthy value then the resolved configuration params will be printed. The config is a union of defaults, values in package.json, and CLI flags. Example:

```
$ VERBOSE=1 flow-annotation-check
Invoking: { command: 'report',
  flags:
   { absolute: false,
     allow_weak: false,
     exclude:
      [ 'src/__tests__/fixtures/comment-blocks-10.js',
        'src/__tests__/fixtures/comment-statement-10.js',
        'src/__tests__/fixtures/no-comments.js' ],
     flow_path: 'flow',
     include: [ 'src/**/*.js' ],
     output: 'text',
     root: '/Users/ryan/Code/flow-annotation-check' } }
flow  src/__tests__/cli-test.js
flow  src/__tests__/core-test.js
flow  src/__tests__/fixtures/comment-blocks-09.flow.js
flow  src/__tests__/fixtures/comment-single-block-09.flow.js
flow  src/__tests__/fixtures/comment-single-block-10.flow.js
flow  src/__tests__/fixtures/comment-statement-09.flow.js
... snip ...
```

### Validate mode

Flow has some internal limits on what annotations it will detect. This might mean some files might not report errors when you run `flow check` on the cli (see [parsing_service_js.ml](https://github.com/facebook/flow/blob/15e0cbfe7139eb56a8f796db7b18515aad413d39/src/parsing/parsing_service_js.ml#L174-L238) in facebook/flow). You can use the `validate` command to verify your existing annotations.

:bangbang::warning: Save your work because `--validate` will modify files in your local filesystem. :warning::bangbang:

```bash
flow-annotation-check --validate
```

The `--validate` mode works by appending a statement that contains an invalid flow type to your files, running flow to collect expected errors, and then cleaning up. By looking at the errors reported we assert that the expected annotation aligns with what flow actually outputs.

The injected statement is:
```
const FLOW_ANNOTATION_CHECK_INJECTED_ERROR: string = null
```
