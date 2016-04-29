var gulp          = require('gulp');
var browserSync   = require('browser-sync').create();

/*================================================================
 # TASK
 ================================================================*/

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch('./index.html').on('change', browserSync.reload);
  gulp.watch('./css/**/*.css').on('change', browserSync.reload);
  gulp.watch('./js/**/*.js').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
