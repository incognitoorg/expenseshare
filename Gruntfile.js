module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		replace: {
			production: {
				env : {
					src: ['war/static-resources/core/envvariables.js'],             // source files array (supports minimatch)
					dest: 'war/static-resources/core/envvariables.js',             // destination directory or file
					replacements: [{ 
						from: "mode='local'",                   // string replacement
						to: "mode='dev'" 
					}, {
						from: '/static-resources/',
						to: function (matchedWord) {   // callback replacement
							return '/built-static-resources/';
						}
					}]
				}
			},
			local: {
				src: ['war/static-resources/core/envvariables.js'],             // source files array (supports minimatch)
				dest: 'war/static-resources/core/envvariables.js',             // destination directory or file
				replacements: [{ 
					from: "mode='dev'",                   // string replacement
					to: "mode='local'" 
				}/*, {
					from: 'Foo',
					to: function (matchedWord) {   // callback replacement
						return matchedWord + ' Bar';
					}
				}*/]
			}
		},
		appengine: {
			options: {
				sdk:'D:/chrome-downloads/appengine-java-sdk-1.8.6/bin',
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
			},
			backend: {
				root: 'backend/',
				backend: true,
				backendName: 'crawler'
			}
		},
		'string-replace': {
			  dist: {
			    files: {
			      'path/to/directory/': 'path/to/source/*', // includes files in dir
			      'path/to/directory/': 'path/to/source/**', // includes files in dir and subdirs
			      'path/to/project-<%= pkg.version %>/': 'path/to/source/**', // variables in destination
			      'path/to/directory/': ['path/to/sources/*.js', 'path/to/more/*.js'], // include JS files in two diff dirs
			      'path/to/filename.ext': 'path/to/source.ext'
			    },
			    options: {
			      replacements: [{
			        pattern: /\/(asdf|qwer)\//ig,
			        replacement: '$1'
			      }, {
			        pattern: ',',
			        replacement: ';'
			      }]
			    }
			  },
			  inline: {
			    options: {
			      replacements: [
			        // place files inline example
			        {
			            pattern: '<script></script>',
			            replacement: '<script></script>'
			          }
			      ]
			    }
			  }
			}

	});

	// Load the plugin that provides the "uglify" task.
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-appengine');

	
	 grunt.registerTask('replaceBack', 'Managing App Engine.', exports.execute);
	// Default task(s).
	//grunt.registerTask('default', ['replace']);

};


//echo "substituting dev settings"
//"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/mode='local'/mode='dev'/g ..\war\static-resources\core\envvariables.js
//"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/\/static-resources\//\/built-static-resources\//g ../war/boilerplate.js
//REM "C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/'fem.appcache'/'builtfem.appcache'/g ../war/index.html
//"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/\"static-resources\//\"built-static-resources\//g ../war/index.html
//"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/require.js/require.min.js/g ../war/index.html
//"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/1\.0/1\.0\.1/g ../war/builtfem.appcache
