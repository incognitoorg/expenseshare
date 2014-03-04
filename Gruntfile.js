module.exports = function(grunt) {

	var requirejsconfig = grunt.file.readJSON('./r-js-optimizer/tools/build.js');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		appengine: {
			options: {
				/*sdk:'C:/Users/VAronde/Downloads/sdk/gae-sdk/appengine-java-sdk-1.8.6/bin',*/
				sdk: process.env.GAE_SDK + '/bin',
				manageScript : 'appcfg.cmd',
				runFlags: {
					port: 8080
				},
				manageFlags: {
					oauth2 : true
				}
			},

			frontend: {
				root: 'war/'
			}/*,
			backend: {
				root: 'backend/',
				backend: true,
				backendName: 'crawler'
			}*/
		},
		requirejs : {
			compile : {
				options : requirejsconfig 
			} 
		},
		'string-replace': {
			toDeploy: {
				files: {
					/*'path/to/directory/': 'path/to/source/*', // includes files in dir
				      'path/to/directory/': 'path/to/source/**', // includes files in dir and subdirs
				      'path/to/project-<%= pkg.version %>/': 'path/to/source/**', // variables in destination
				      'path/to/directory/': ['path/to/sources/*.js', 'path/to/more/*.js'], // include JS files in two diff dirs
					 */			      
					'war/static-resources/core/envvariables.js': 'war/static-resources/core/envvariables.js',
					'war/boilerplate.js': 'war/boilerplate.js',
					'war/index.html': 'war/index.html',
				},
				options: {
					replacements: [{
						pattern: "/static-resources/",
						replacement: "/built-static-resources/"
					}, {
						pattern: "mode='local'",
						replacement: "mode='dev'"
					},
					 {
						pattern: "'fem.appcache'",
						replacement: "'builtfem.appcache'"
					},
					 {
						pattern: "require.js",
						replacement: "require.min.js"
					}]
				}
			},
			toLocal: {
				files: {
					'war/static-resources/core/envvariables.js': 'war/static-resources/core/envvariables.js',
					'war/boilerplate.js': 'war/boilerplate.js',
					'war/index.html': 'war/index.html',
				},
				options: {
					replacements: [{
						pattern: "/built-static-resources/",
						replacement: "/static-resources/"
					}, {
						pattern: "mode='dev'",
						replacement: "mode='local'"
					},
					 {
						pattern: "'builtfem.appcache'",
						replacement: "'fem.appcache'"
					},
					 {
						pattern: "require.min.js",
						replacement: "require.js"
					}]
				}
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-appengine');
	grunt.loadNpmTasks('grunt-contrib-requirejs');


	// Default task(s).
	grunt.registerTask('default',function(){
		grunt.task.run(['all']);
	});
	
	grunt.registerTask('all', ['string-replace:toDeploy', 'requirejs', 'appengineUpdateWrapper', 'string-replace:toLocal'])
	grunt.registerTask('onlyupload', ['string-replace:toDeploy', /*'requirejs',*/ 'appengineUpdateWrapper', 'string-replace:toLocal'])
	grunt.registerTask('appengineUpdateWrapper', function(){
		var gaeSDK = process.env.GAE_SDK;
		if(!gaeSDK){
			console.error('\nGAE SDK not configured. Please set env variables GAE_SDK to gae sdk path. \n\nFor more info about env variable visit http://en.wikipedia.org/wiki/Environment_variable ')
			return false;
		}
		grunt.task.run(['appengine:update:frontend']);
	});
};