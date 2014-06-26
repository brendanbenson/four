module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['build'],

    jade: {
      build: {
        options: {
          data: {}
        },
        files: [{
          expand: true,
          cwd: 'app/partials',
          src: [ '**/*.jade' ],
          dest: 'build',
          ext: '.html'
        }]
      }
    },

    concat: {
      options: {
        separator: ';\n'
      },
      build: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-ui-router/release/angular-ui-router.min.js',
          'bower_components/underscore/underscore.js',
          'bower_components/fastclick/lib/fastclick.js'
        ],
        dest: 'build/vendor.js'
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'app/', src: ['**/*.js', '**/*.css'], dest: 'build/'},
          {expand: true, cwd: 'app/images', src: '**/*', dest: 'build/images'},
          {src: 'bower_components/open-sans-fontface/open-sans.css', dest: 'build/open-sans.css'},
          {expand: true, cwd: 'bower_components/open-sans-fontface/fonts', src: '**/*', dest: 'build/fonts'}
        ]
      }
    },

    compass: {
      build: {
        options: {
          sassDir: 'app/style',
          cssDir: 'build'
        }
      }
    },

    watch: {
      build: {
        files: ['app/**/*'],
        tasks: ['default']
      },
      test: {
        files: ['app/**/*', 'server/**/*', 'server.js', 'test/**/*Spec.js'],
        tasks: ['test']
      },
      unit: {
        files: ['app/**/*', 'server/**/*', 'server.js', 'test/**/*Spec.js'],
        tasks: ['unit']
      }
    },

    notify: {
      build: {
        options: {
          title: 'Four build complete!',
          message: 'Great success!'
        }
      },
      test: {
        options: {
          title: 'Tests passed!',
          message: 'Great success!'
        }
      }
    },

    mochaTest: {
      all: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      },
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/server/unit/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['clean', 'jade:build', 'concat:build', 'copy:build', 'compass:build', 'notify:build']);
  grunt.registerTask('test', ['mochaTest:all', 'notify:test']);
  grunt.registerTask('unit', ['mochaTest:unit', 'notify:test']);
};