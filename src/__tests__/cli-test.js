'use strict';

/**
 * @flow
 */

import path from 'path';
import {getParser, main, resolveArgs} from '../cli';

describe('cli', () => {
  describe('resolveArgs', () => {
    const MOCK_ARGS = {
      root: '.',
    };

    it('should add all the default fields', () => {
      const result = resolveArgs({});
      expect(result).toEqual({
        exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
        flow_path: 'flow',
        include: ['**/*.js'],
        root: path.resolve(path.join(__dirname, '../..')),
      });
    });

    it('should parse the root into a full path', () => {
      const result = resolveArgs(MOCK_ARGS);
      expect(result.root).toMatch(/\//);
      expect(result).toMatchObject({
        root: path.resolve(path.join(__dirname, '../..')),
      });
    });

    it('should setup defaults for include', () => {
      const result = resolveArgs(MOCK_ARGS);
      expect(result).toMatchObject({
        include: ['**/*.js'],
      });
    });

    it('should setup defaults for exclude', () => {
      const result = resolveArgs(MOCK_ARGS);
      expect(result).toMatchObject({
        exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
      });
    });

    it('should let include and exclude pass through when not falsey', () => {
      const result = resolveArgs({
        include: ['*.js'],
        exclude: ['*.coffee'],
        root: '.',
      });
      expect(result).toMatchObject({
        include: ['*.js'],
        exclude: ['*.coffee'],
      });
      expect(result.root).toMatch(/\//);
    });

  });
});
