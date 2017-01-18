# flow-annotation-check [![Build Status](https://travis-ci.org/ryan953/flow-annotation-check.svg?branch=master)](https://travis-ci.org/ryan953/flow-annotation-check)

Check your `@flow` and `@flow weak` annotations in your javascript files.

Install with NPM.

```
npm install flow-annotation-check
```

or use the global flag to easily run from the cli

```
npm install --global flow-annotation-check
```

## As a library

You can import `flow-annotation-check` into your own module and have the checker return a list of files for you to further process.

```
const flowAnnotationCheck = require('flow-annotation-check');
```

The most useful methods are:

- `genReport(folder: string, config: Config): Promise<Array<FileReport>>`
- `getStatus(filePath: string): Promise<FlowStatus>`

The types involved are:

```
type Config = {
  includes: Array<string>,
  excludes: Array<string>,
  absolute: boolean,
};

type FlowStatus = 'flow' | 'flow weak' | 'no flow';

type FileReport = {
  file: string,
  status: FlowStatus,
};
```

### genReport(folder: string, config: Config): Promise<Array<FileReport>>

If you want to check a whole project at once, then call `genReport`. You can pass in the root folder, like `~/my-project/src` and then a configuration object with some glob strings to find your files. `genReport` will return a Promise that will resolve when all matching files have had their flow-status discovered.

This is a convienence method to make working with globs and mapping over `getStatus` easier. Each file is tested serially in order to avoid setting really long timeouts that lock up the flow server.

```
flowAnnotationCheck.genReport(
  '~/path/to/project',
  {
    include: ['**/*.js'],
    exclude: ['**/*.coffee'],
    absolute: true,
  }
).then((entries) => {
  entries.forEach((entry) => {
    console.log(entry.status + ' ' + entry.file);
  });
});
```

### getStatus(filePath: string): Promise<FlowStatus>

If you're checking one file at a time then call go ahead and call `getStatus` directly. This takes a string that will be passed directly into `flow` on the command line.

```
flowAnnotationCheck.getStatus(
  '~/path/to/project/src/main.js'
).then((status) => {
  console.log(status);
});
```

## CLI

You can run the binary from the CLI to get a list of which files are annotated and how.

The quickest way to get started is:

```
npm install -g flow-annotation-check

cd ~/my-project
flow-annotation-check
```

If you don't want to install the package globally you can still run it from the CLI by adding it to your `package.json` file:

```
# package.json

{
  scripts: {
    annotations: 'flow-annotation-check',
  },
}

Then run that script:

```
npm run annotations
```

Flow also has some internal limits on what annotations it will detect. This might mean some files are not reporting errors when you run `flow check` on the cli (see [docblock.ml](https://github.com/facebook/flow/blob/master/src/parsing/docblock.ml#L39-L101) in facebook/flow). You can use the `validate` command to verify your existing annotations.

```
flow-annotation-check --validate
```


VERBOSE=true ./node_modules/.bin/flow-annotation-check ~/my-project

./node_modules/.bin/flow-annotation-check ~/my-project -i '**/*.js' -i '**/*.jsx'
./node_modules/.bin/flow-annotation-check ~/my-project -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'

VERBOSE=true ./node_modules/.bin/flow-annotation-check -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'
VERBOSE=true ./node_modules/.bin/flow-annotation-check -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'


VERBOSE=true ./node_modules/.bin/flow-annotation-check -i 'src/__tests__/fixtures/*.js'
