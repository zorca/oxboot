/*
 * Config
 */
// Paths
var SRC_PATH =          './app',
    DEV_PATH =          './dev',
    PUB_PATH =          './pub',
    DEST_PATH =         PUB_PATH,
// Folders
    TEMPLATES_FOLDER =  'templates',
    TEMPLATE_NAME =     'default',
    STYLES_FOLDER =     'styles',
    SCRIPTS_FOLDER =    'scripts',
    IMAGES_FOLDER =     'images',
// Options
    CSS_PREPROCESSOR =  'less',
    TEMPLATES_EXT =     '.php',
    DEV_SERVER =        true,
    DEV_MODE =          false;

/*
 * Config & Gulp plugins
 */
var config = require('./config.json'),
    del = require('del'),
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
    cssmin = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    templatesglob = require('gulp-jade-globbing'),
    stylesglob = require('gulp-css-globbing'),
    rename = require('gulp-rename');

// Destination Path if Development Mode On
if (DEV_MODE) {
    DEST_PATH = DEV_PATH
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
        base: DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME, port:8010, keepalive: true
    });
});

// Clean Destination folder
gulp.task('clean', function (cb) {
    del(DEST_PATH+'*', cb);
});

// Jade task
gulp.task('templates', function() {
    return gulp.src(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/**/[^_]*.jade')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(templatesglob())
        .pipe(jade({
            pretty: true,
            locals: {
                "TEMPLATES_FOLDER": TEMPLATES_FOLDER,
                "TEMPLATE_NAME": TEMPLATE_NAME
            }
        }))
        .pipe(rename({
            extname: TEMPLATES_EXT
        }))
        .pipe(gulp.dest(DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME))
});

switch (CSS_PREPROCESSOR) {
    case 'less':
        // Less task
        gulp.task('styles', function() {
            return gulp.src(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/[^_]*.less')
                .pipe(stylesglob({
                    extensions: ['.css','.less'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(less({errLogToConsole: true}))
                .pipe(gulpif(!DEV_MODE, cssmin()))
                .pipe(gulpif(!DEV_MODE, rename({extname: '.min.css'})))
                .pipe(gulp.dest(DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER));
        });
        break;
    case 'sass':
        // Sass task
        gulp.task('styles', function() {
            return gulp.src(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/[^_]*.scss')
                .pipe(stylesglob({
                    extensions: ['.css','.scss'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(scss({errLogToConsole: true}))
                .pipe(gulpif(!DEV_MODE, cssmin()))
                .pipe(gulpif(!DEV_MODE, rename({extname: '.min.css'})))
                .pipe(gulp.dest(DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER));
        });
    break
}

// Scripts task
gulp.task('scripts', function() {
    return gulp.src([SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/[^_]*.js'])
        .pipe(gulp.dest(DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER));
});

// Images task
gulp.task('images', function() {
    return gulp.src([SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER+'/**/*'])
        .pipe(gulp.dest(DEST_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER));
});

// Watch tasks
gulp.task('watch', function() {
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/**/*.jade', ['templates' , reload]);
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/*.less', ['styles', reload]);
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/*.scss', ['styles', reload]);
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/*.js', ['scripts', reload]);
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('server','templates','styles', 'scripts','images','watch');
});
