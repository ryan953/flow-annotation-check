'use strict';

/**
 * @flow
 */

import path from 'path';
import {genCountVisibleFiles, genCheckFlowStatus, genForceErrors} from '../flow';

const FIXTURE_FILE_COUNT = 17;

const flowDetectedFixtures = [
  {status: 'flow', file: './fixtures/comment-blocks-09.flow.js'},
  {status: 'flow', file: './fixtures/comment-single-block-09.flow.js'},
  {status: 'flow', file: './fixtures/comment-single-block-10.flow.js'},
  {status: 'flow', file: './fixtures/comment-statement-09.flow.js'},
  {status: 'flow', file: "./fixtures/file-with-'single'-quotes.js"},
  {status: 'flow', file: './fixtures/file-with-"double"-quotes.js'},
  {status: 'flow', file: './fixtures/file-with-$-money.js'},
  {status: 'flow', file: './fixtures/file-with a-space.js'},
  {status: 'flow', file: './fixtures/file-with-\\-a-slash.js'},
  {status: 'flow', file: './fixtures/file-with-`backtick`-quotes.js'},
];
const flowFailedFixtures = [
  {status: 'no flow', file: './fixtures/comment-blocks-10.js'},
  {status: 'no flow', file: './fixtures/comment-statement-10.js'},
  {status: 'no flow', file: './fixtures/no-comments.js'},
];
const magicStringFixtures = [
  {status: 'flow', file: './fixtures/use-babel-block.flow.js'},
  {status: 'flow', file: './fixtures/use-babel-statement.flow.js'},
  {status: 'flow', file: './fixtures/use-strict-block.flow.js'},
  {status: 'flow', file: './fixtures/use-strict-statement.flow.js'},
];

describe('genCountVisibleFiles', () => {
  it('should count the fixtures visible', () => {
    const dir = path.resolve(__dirname, './fixtures');

    return genCountVisibleFiles('flow', dir).then((count) => {
      expect(count).toEqual(FIXTURE_FILE_COUNT);
    });
  });

  it('should count the fixtures visible', () => {
    const dir = path.resolve(__dirname, './foo-bar');

    return genCountVisibleFiles('flow', dir)
      .then(() => {
        expect(false).toBeTruthy();
      }).catch((error) => {
      expect(
        error.toString()
      ).toMatch(/Error: Could not find file or directory/);
    });
  });
});

describe('genCheckFlowStatus', () => {
  function testCheckFlowStatus(fixture) {
    it(`should return ${fixture.status} for ${fixture.file}`, () => {
      return genCheckFlowStatus(
        'flow',
        path.resolve(__dirname, fixture.file)
      ).then((status) => {
        expect(status).toEqual(fixture.status);
      }).catch((error) => {
        throw Error(JSON.stringify(error));
      });
    });
  }

  flowDetectedFixtures.forEach(testCheckFlowStatus);
  flowFailedFixtures.forEach(testCheckFlowStatus);
  magicStringFixtures.forEach(testCheckFlowStatus);
});

describe('genForceErrors', () => {
  const dir = path.resolve(__dirname, './fixtures');
  const flags = {
    validate: false,
    absolute: true,
    allow_weak: false,
    exclude: [],
    flow_path: 'flow',
    include: [],
    output: 'text',
    summary_only: false,
    html_file: null,
    csv_file: null,
    junit_file: null,
    root: '.',
  };

  function testForceErrors(fixture) {
    const files = [path.resolve(__dirname, fixture.file)];

    switch (fixture.status) {
      case 'flow':
      case 'flow weak':
        it(`should list ${fixture.file} because flow checks it`, () => {
          return genForceErrors(dir, files, flags).then((results) => {
            expect(results).toEqual(files);
          });
        });
        break;
      case 'no flow':
        it(`should not list ${fixture.file} because flow can't see it`, () => {
          return genForceErrors(dir, files, flags).then((results) => {
            expect(results).toEqual([]);
          });
        });
        break;
      default:
        throw new Error(`Unexpected fixture.status ${fixture.status}`);
    }
  }

  flowDetectedFixtures.forEach(testForceErrors);
  flowFailedFixtures.forEach(testForceErrors);
  magicStringFixtures.forEach(testForceErrors);
});
