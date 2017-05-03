const gulp = require('gulp');
const runSequence = require('run-sequence');

const concat = require('gulp-concat');
const cssmin = require('gulp-minify-css');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const prefix = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const handlebars = require('gulp-compile-handlebars');
const eslint = require('gulp-eslint');
const gutil = require('gulp-util');
const sitemap = require('gulp-sitemap');
//const robots = require('gulp-robots');

// default task
gulp.task('default', ['handlebars','scripts','styles','images','icon','watch']);

// build task
gulp.task('build', function() {
  runSequence(['handlebars','scripts','styles','images','icon'],'sitemap','lint');
});

// watch task
gulp.task('watch', function() {
  gulp.watch(['./src/handlebars/partials/*.handlebars', './src/handlebars/*.handlebars'], ['handlebars']);
  gulp.watch('./src/js/*.js', ['scripts']);
  gulp.watch('./src/scss/*.scss', ['styles']);
  gulp.watch(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.gif'], ['images']);
  gulp.watch('./src/assets/*.ico', ['icon']);
});

// Handlebars HTML build task
gulp.task('handlebars', function () {
  var templateData = {
  },
  options = {
      ignorePartials: true, // ignores unknown partials in the template, defaults to false
      batch : ['./src/handlebars/partials']
  }
  return gulp.src('./src/handlebars/*.handlebars')
      .pipe(handlebars(templateData, options))
      .on('error', gutil.log)
      .pipe(rename({
        extname: '.html'
      }))
      .pipe(gulp.dest('./'));
});


// scripts task
gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('app.js'))
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/js/'))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/js/'));
});

// styles task
gulp.task('styles', function() {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .on('error', gutil.log)
    .pipe(prefix('last 2 versions'))
    .on('error', gutil.log)
    .pipe(concat('styles.css'))
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(cssmin())
    .on('error', gutil.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/css/'))
});

// images task
gulp.task('images', function() {
  return gulp.src(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.gif'])
    .pipe(imagemin())
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/assets/'))
});

// icon task
gulp.task('icon', function() {
  return gulp.src('./src/assets/*.ico')
    .pipe(gulp.dest('./dist/assets/'))
});

// lint task
gulp.task('lint', function() {
  return gulp.src('./dist/js/app.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// sitemap task
gulp.task('sitemap', function () {
  gulp.src('./*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: 'https://adoptopenjdk.net'
    }))
    .pipe(gulp.dest('./'));
});

// robots task - commented out unless required.
/*gulp.task('robots', function () {
  gulp.src('index.html')
    .pipe(robots({
      useragent: '*',
      allow: ['/'],
      disallow: ['cgi-bin/']
    }))
    .pipe(gulp.dest('./'));
});*/
