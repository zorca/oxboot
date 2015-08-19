/*
 * Config
 */

var config = require('./config.json');

// Paths
var DEST_PATH        =  config.path.pub,

// Folders
    TEMPLATE_NAME =     'default',

// Options
    CSS_PREPROCESSOR =  'sass';

/*
 * Gulp plugins
 */
var del = require('del'),
    gulp = require('gulp'),
    connect = require('gulp-connect-php'),
    browsersync = require('browser-sync'),
    reload  = browsersync.reload,
    plumber = require('gulp-plumber'),
    debug = require('gulp-debug'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    scss = require('gulp-sass'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    templatesglob = require('gulp-jade-globbing'),
    stylesglob = require('gulp-css-globbing'),
    rename = require('gulp-rename');

// Destination Path if Development Mode On
if (config.options.dev_mode) {
    DEST_PATH = config.path.dev
}

// Server task
gulp.task('server', function() {
    browsersync({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
    connect.server({
        base: DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME, port:8010, keepalive: true
    });
});

// Clean Destination folder
gulp.task('clean', function (cb) {
    del(DEST_PATH+'*', cb);
});

// Jade task
gulp.task('templates', function() {
    return gulp.src(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/**/[^_]*.jade')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(templatesglob())
        .pipe(jade({
            pretty: true,
            locals: {
                "TEMPLATES_FOLDER": config.folder.templates,
                "TEMPLATE_NAME": TEMPLATE_NAME
            }
        }))
        .pipe(rename({
            extname: config.options.templates_ext
        }))
        .pipe(gulp.dest(DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME))
});

switch (CSS_PREPROCESSOR) {
    case 'less':
        // Less task
        gulp.task('styles', function() {
            return gulp.src(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/[^_]*.less')
                .pipe(stylesglob({
                    extensions: ['.css','.less'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(less({errLogToConsole: true}))
                .pipe(gulpif(!config.options.dev_mode, cssmin()))
                .pipe(gulpif(!config.options.dev_mode, rename({extname: '.min.css'})))
                .pipe(gulp.dest(DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER));
        });
        break;
    case 'sass':
        // Sass task
        gulp.task('styles', function() {
            return gulp.src(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/[^_]*.scss')
                .pipe(stylesglob({
                    extensions: ['.css','.scss'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(scss({errLogToConsole: true}))
                .pipe(csscomb())
                .pipe(gulpif(!config.options.dev_mode, cssmin()))
                .pipe(gulpif(!config.options.dev_mode, rename({extname: '.min.css'})))
                .pipe(gulp.dest(DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER));
        });
    break
}

// Scripts task
gulp.task('scripts', function() {
    return gulp.src([config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/[^_]*.js'])
        .pipe(gulp.dest(DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER));
});

// Images task
gulp.task('images', function() {
    return gulp.src([config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER+'/**/*'])
        .pipe(gulp.dest(DEST_PATH+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER));
});

// Watch tasks
gulp.task('watch', function() {
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/**/*.jade', ['templates' , reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/*.less', ['styles', reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/*.scss', ['styles', reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/*.js', ['scripts', reload]);
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('server','templates','styles', 'scripts','images','watch');
});
