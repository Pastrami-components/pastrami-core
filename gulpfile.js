var gulp = require('gulp');
require('@battr/battr-build/lib/default-config').names = {
  file: 'battr-core',
  module: 'battrCore',
  styles: 'battr-core'
};
require('@battr/battr-build');
