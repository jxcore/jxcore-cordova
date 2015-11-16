var path = require('path');

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'dist/bundle.js': ['clientscripts/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');

    // Run the server
    grunt.registerTask('server', ['browserify']);

    // Default task(s).
    grunt.registerTask('default', ['server']);

};

