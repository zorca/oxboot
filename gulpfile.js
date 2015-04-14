/*
 * Config
 */
// Paths
var SRC_PATH =          './app',
    DEV_PATH =          './dev',
    PUB_PATH =          './pub',
// Folders
    TEMPLATES_FOLDER =  'templates',
    TEMPLATE_NAME =     'default',
    STYLES_FOLDER =     'styles',
    SCRIPTS_FOLDER =    'scripts',
    IMAGES_FOLDER =     'images',
// Options
    TEMPLATES_EXT =     '.php',
    DEV_SERVER =        true;

/*
 * Gulp plugins
 */
var del = require('del'),
    gulp = require('gulp'),
    connect = require('gulp-connect-php'),
    debug = require('gulp-debug'),
    gulpif = require('gulp-if'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    templatesglob = require('gulp-jade-globbing'),
    stylesglob = require('gulp-css-globbing'),
    rename = require('gulp-rename');

// PHP server task
gulp.task('server', function() {
    connect.server({
        base: DEV_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME
    });
});

// Clean Dev folder
gulp.task('clean:dev', function (cb) {
    del(DEV_PATH+'*', cb);
});

// Jade Dev task
gulp.task('templates:dev', function() {
    return gulp.src(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/**/[^_]*.jade')
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
        .pipe(gulp.dest(DEV_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME))
});

// Scss Dev task
gulp.task('styles:dev', function() {
    return gulp.src(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/[^_]*.less')
        .pipe(stylesglob({
            extensions: ['.css','.less'],
            scssImportPath: {
                leading_underscore: true,
                filename_extension: false
            }
        }))
        .pipe(less({errLogToConsole: true}))
        .pipe(gulp.dest(DEV_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER));
});

// Scripts Dev task
gulp.task('scripts:dev', function() {
    return gulp.src([SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/[^_]*.js'])
        .pipe(gulp.dest(DEV_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER));
});

// Images Dev task
gulp.task('images:dev', function() {
    return gulp.src([SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER+'/**/[^_]*.*'])
        .pipe(gulp.dest(DEV_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+IMAGES_FOLDER));
});

// Watch tasks
gulp.task('watch:dev', function() {
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/**/*.jade', ['templates:dev']);
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+STYLES_FOLDER+'/**/*.less', ['styles:dev']);
    gulp.watch(SRC_PATH+'/'+TEMPLATES_FOLDER+'/'+TEMPLATE_NAME+'/'+SCRIPTS_FOLDER+'/**/*.js', ['scripts:dev']);
});

// Default task
gulp.task('default', ['clean:dev'], function() {
    gulp.start('server','templates:dev','styles:dev', 'scripts:dev', 'images:dev','watch:dev');
});
