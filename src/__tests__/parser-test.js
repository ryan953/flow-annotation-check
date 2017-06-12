'use strict';

/**
 * @flow
 */

import path from 'path';
import getParser from '../parser';
import {DEFAULT_FLAGS} from '../types';

describe('getParser', () => {
  it('should print the help message', () => {
    expect(getParser().formatHelp()).toMatchSnapshot();
  });
});
