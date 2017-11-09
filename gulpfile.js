const gulp = require('gulp');
// ES6 JS/JSX Lineter -- Check for syntax errors
const eslint = require('gulp-eslint');
// Test Framework
const mocha = require('gulp-mocha');

// Lint JS/JSX Files (For Express)
gulp.task('lint', () => {
  return gulp.src('index.js')
    .pipe(eslint({ configFile: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
  return gulp.src('test/index.js', { read: false })
    .pipe(mocha())
    .once('error', () => {
      process.exit(1);
    });
});

gulp.task('default', ['test']);
