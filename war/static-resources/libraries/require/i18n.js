/**
 * @license RequireCSS 0.3.1 Copyright (c) 2011, VIISON All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/VIISON/RequireCSS for details
 */

/*jslint forin: true */
/*global document: true, setTimeout: true, define: true */

(function () {
	"use strict";

	
	

	define(function () {
		var css;

		css = {
			version: '0.3.1',

			load: function (name, req, load) { //, config (not used)
				// convert name to actual url
				var url = req.toUrl(
					// Append default extension
					name.search(/\.(css|less|scss)$/i) === -1 ? name + '.css' : name
				);

				// Test if the browser supports the link load event,
				// in case we don't know yet (mostly WebKit)
				if (nativeLoad === undefined) {
					// Create a link element with a data url,
					// it would fire a load event immediately
					var link = createLink('data:text/css,');

					link.onload = function () {
						// Native link load event works
						nativeLoad = true;
					};

					head.appendChild(link);

					// Schedule function in event loop, this will
					// execute after a potential execution of the link onload
					setTimeout(function () {
						head.removeChild(link);

						if (nativeLoad !== true) {
							// Native link load event is broken
							nativeLoad = false;
						}

						loadSwitch(url, load);
					}, 0);
				} else {
					loadSwitch(url, load);
				}
			}
		};

		return css;
	});
}());