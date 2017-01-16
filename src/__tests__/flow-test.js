'use strict';

const path = require('path');
const {countVisibleFiles, checkFlowStatus, forceErrors} = require('../flow');

const FIXTURE_FILE_COUNT = 11;

const flowDetectedFixtures = [
  {status: 'flow', file: './fixtures/comment-blocks-09.flow.js'},
  {status: 'flow', file: './fixtures/comment-single-block-09.flow.js'},
  {status: 'flow', file: './fixtures/comment-single-block-10.flow.js'},
  {status: 'flow', file: './fixtures/comment-statement-09.flow.js'},
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

describe('countVisibleFiles', () => {
  it('should count the fixtures visible', () => {
    const dir = path.resolve(__dirname, './fixtures');

    return countVisibleFiles(dir).then((count) => {
      expect(count).toEqual(FIXTURE_FILE_COUNT);
    });
  });

  it('should count the fixtures visible', () => {
    const dir = path.resolve(__dirname, './foo-bar');

    return countVisibleFiles(dir).catch((error) => {
      expect(count).toEqual(Infinity);
    });
  });
});

describe('checkFlowStatus', () => {
  function testCheckFlowStatus(fixture) {
    it(`should return ${fixture.status} for ${fixture.file}`, () => {
      return checkFlowStatus(
        path.resolve(__dirname, fixture.file)
      ).then((status) => {
        expect(status).toEqual(fixture.status);
      });
    });
  }

  flowDetectedFixtures.forEach(testCheckFlowStatus);
  flowFailedFixtures.forEach(testCheckFlowStatus);
  magicStringFixtures.forEach(testCheckFlowStatus);
});

describe('forceErrors', () => {
  const dir = path.resolve(__dirname, './fixtures');
  const flags = {absolute: true};

  function testForceErrors(fixture) {
    const files = [path.resolve(__dirname, fixture.file)];

    switch (fixture.status) {
      case 'flow':
      case 'flow weak':
        it(`should list ${fixture.file} because flow checks it`, () => {
          return forceErrors(dir, files, flags).then((results) => {
            expect(results).toEqual(files);
          });
        });
        break;
      case 'no flow':
        it(`should not list ${fixture.file} because flow can't see it`, () => {
          return forceErrors(dir, files, flags).then((results) => {
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
