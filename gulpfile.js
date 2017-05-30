const gulp = require('gulp');
const runSequence = require('run-sequence');

const browserSync = require('browser-sync').create();
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
const hash = require('gulp-hash');
const inject = require('gulp-inject');
//const robots = require('gulp-robots');

// default task
gulp.task('default', function() {
  runSequence(['handlebars','scripts','styles','images','icon'],'inject','watch','browser-sync');
});

// build task
gulp.task('build', function() {
  runSequence(['handlebars','scripts','styles','images','icon'],'inject','sitemap','lint');
});

// watch task
gulp.task('watch', function() {
  gulp.watch(['./src/handlebars/partials/*.handlebars', './src/handlebars/*.handlebars'], function() {
    runSequence('handlebars','inject', browserSync.reload);
  });
  gulp.watch('./src/js/*.js', function() {
    runSequence('scripts','inject', browserSync.reload);
  });
  gulp.watch('./src/scss/*.scss', function() {
    runSequence('styles','inject', browserSync.reload);
  });
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
    .pipe(hash()) // Add hashes to the files' names
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/js/'))
    .pipe(hash.manifest('assetsJS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/js'
    })) // Switch to the manifest file
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
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
    .pipe(hash()) // Add hashes to the files' names
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(hash.manifest('assetsCSS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/css'
    })) // Switch to the manifest file
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
});

// inject task
gulp.task('inject', function() {
  var sourceFiles = gulp.src(['./dist/js/app.min-*.js', './dist/css/styles.min-*.css'], {read: false}, {relative: true});
  var targetFiles = gulp.src('./*.html');

  return targetFiles.pipe(inject(sourceFiles)) // injects the latest minified JS and CSS into all HTML files
  .pipe(gulp.dest('./'));
});

// images task
gulp.task('images', function() {
  return gulp.src(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.gif'])
    .pipe(imagemin())
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/assets/'));
});

// icon task
gulp.task('icon', function() {
  return gulp.src('./src/assets/*.ico')
    .pipe(gulp.dest('./dist/assets/'));
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

// browser-sync task
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        notify: false
    });
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
