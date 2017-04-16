# flow-annotation-check [![Build Status](https://travis-ci.org/ryan953/flow-annotation-check.svg?branch=master)](https://travis-ci.org/ryan953/flow-annotation-check)

[![Greenkeeper badge](https://badges.greenkeeper.io/ryan953/flow-annotation-check.svg)](https://greenkeeper.io/)

Verify the `@flow` and `@flow weak` annotations in your javascript files.

Install with NPM:

```bash
npm install flow-annotation-check
```

or use the global flag to easily run from bash:

```bash
npm install --global flow-annotation-check
```

## As a library

Once installed you can import `flow-annotation-check` into your own module and have the checker return a list of files for you to further process.

```javascript
const flowAnnotationCheck = require('flow-annotation-check');
```

The most useful methods are:

- `genReport(folder: string, config: Config): Promise<Array<FileReport>>`
- `getStatus(filePath: string): Promise<FlowStatus>`

The types involved are:

```javascript
type Glob = string; // See https://github.com/isaacs/node-glob

type Config = {
  include: Array<Glob>,
  exclude: Array<Glob>,
  absolute: boolean,
};

type FlowStatus = 'flow' | 'flow weak' | 'no flow';

type FileReport = {
  file: string,
  status: FlowStatus,
};
```

#### genReport(folder, config)

If you want to check a whole project at once, then call `genReport`. You can pass in the root folder, like `~/my-project/src` and then a configuration object with some glob strings to find your files. `genReport` will return a Promise that will resolve when all matching files have had their flow-status discovered.

This is a convienence method to make working with globs and mapping over `getStatus` easier. Each file is tested serially in order to avoid setting really long timeouts that lock up the flow server.

```javascript
flowAnnotationCheck.genReport(
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

#### getStatus(filePath)

If you're checking one file at a time then go ahead and call `getStatus` directly. This takes a string that will be passed directly into `flow` on the command line.

```javascript
const file = '~/path/to/project/src/main.js';
flowAnnotationCheck.getStatus(file).then((status) => {
  console.log(`The status of ${file} is ${status}`);
});
```

## CLI

If you don't want to install the package globally you can run `flow-annotation-check` from the CLI by adding it to your `package.json` file:

```json
{
  "scripts": {
    "annotations": "flow-annotation-check"
  }
}
```

Then run that script:

```bash
npm run annotations
```

or if installed globally:

```bash
flow-annotation-check ~/path/to/project
```

The available commands can be found by running `flow-annotation-check -h` or `npm run annotations -- --help`.

The common settings you will use are:

* `-i`, `--include`  Glob for files to include. Can be set multiple times.
* `-x`, `--exclude`  Glob for files to exclude. Can be set multiple times.
* `-a`, `--absolute` Report absolute path names. The default is to report only filenames.

Setting `--exclude` will override the defaults. So don't forget to ignore `node_modules/**/*.js` in addition to project specific folders.

### Validate mode

Flow has some internal limits on what annotations it will detect. This might mean some files might not report errors when you run `flow check` on the cli (see [docblock.ml](https://github.com/facebook/flow/blob/master/src/parsing/docblock.ml#L39-L101) in facebook/flow). You can use the `validate` command to verify your existing annotations.

:bangbang::warning: Save your work because `--validate` will modify files in your local filesystem. :warning::bangbang:

```bash
flow-annotation-check --validate
```

