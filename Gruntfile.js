'use strict';

module.exports = function(grunt)                                                {
    grunt.initConfig({
        pkg: '<json:package.json>', 
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true
            },
            globals: {
                exports: true,
                module: false
            }
        },
        concat: {
            js: {
                src: 'src/**/*.js', dest: 'public/js/application.js'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', 'concat');
}
