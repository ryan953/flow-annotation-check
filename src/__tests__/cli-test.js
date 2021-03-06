'use strict';

/**
 * @flow
 */

import path from 'path';
import {getParser, main, resolveArgs} from '../cli';
import {DEFAULT_FLAGS} from '../types';

describe('cli', () => {
  describe('resolveArgs', () => {
    const MOCK_ARGS = {
      root: '.',
    };

    it('should add all the default fields', () => {
      const result = resolveArgs({}, DEFAULT_FLAGS);
      expect(result).toEqual({
        validate: false,
        absolute: false,
        level: 'flow',
        exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
        flow_path: 'flow',
        include: ['**/*.js'],
        output: 'text',
        show_summary: false,
        list_files: 'all',
        html_file: null,
        csv_file: null,
        junit_file: null,
        json_file: null,
        summary_file: null,
        root: path.resolve(path.join(__dirname, '../..')),
      });
    });

    it('should parse the root into a full path', () => {
      const result = resolveArgs(MOCK_ARGS, DEFAULT_FLAGS);
      expect(result.root).toMatch(/\//);
      expect(result).toMatchObject({
        root: path.resolve(path.join(__dirname, '../..')),
      });
    });

    it('should override defaults when allow_weak is enabled', () => {
      const result = resolveArgs({allow_weak: true}, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        level: 'flowweak',
      });
    });

    it('should override defaults when require-strict-local is enabled', () => {
      const result = resolveArgs({require_strict_local: true}, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        level: 'flowstrictlocal',
      });
    });

    it('should override defaults when require-strict is enabled', () => {
      const result = resolveArgs({require_strict: true}, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        level: 'flowstrict',
      });
    });

    it('should override defaults when level is set', () => {
      const result = resolveArgs({level: 'any'}, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        level: 'any',
      });
    });

    it('should setup defaults for include', () => {
      const result = resolveArgs(MOCK_ARGS, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        include: ['**/*.js'],
      });
    });

    it('should setup defaults for exclude', () => {
      const result = resolveArgs(MOCK_ARGS, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
      });
    });

    it('should let include and exclude pass through when not falsey', () => {
      const result = resolveArgs({
        include: ['*.js'],
        exclude: ['*.coffee'],
        root: '.',
      }, DEFAULT_FLAGS);
      expect(result).toMatchObject({
        include: ['*.js'],
        exclude: ['*.coffee'],
      });
      expect(result.root).toMatch(/\//);
    });

  });
});
