'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var request = require('request');
var AdmZip = require('adm-zip');
var path = require('path');
var tmp = require('tmp');
var fs = require('fs');
var async = require('async');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in swagger-node (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
 
module.exports = {
  download: download
};

/*
  Functions in swagger-node controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function download(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  // get the structure of the API!
  // get the generated html for each page
  // zip it up!
  var model = "https://api.enterprise.apigee.com/v1/o/"+ req.swagger.params.org.value +"/apimodels/"+ req.swagger.params.model.value;
  var options = {
    url: model +"/revisions/latest?expand=true",
    headers: {
      'Authorization': req.headers.authorization
    }
  };
  
	function getHtml(method, cb) {
		var docUrl = model + "/revisions/" + method.revisionNumber + "/resources/" + method.resourceId + "/methods/" + method.id + "/doc";
		request.get({
		  url: docUrl, 
			headers: {'Authorization': req.headers.authorization}
    },
    function (error, response, body) {
      zipper.addFile(method.name + ".html", body);
      console.log(method.name);
      cb(null, body);
  	});
	}

	function methodDocs(resource, cb) {
		async.map(resource.methods, getHtml, cb)
	}

	function getModelDocs(error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);

			request.get({
				url: model + "/revisions/" + data.revisionNumber + "/doc?template=zipper", 
				headers: {'Authorization': req.headers.authorization}
			},
			function (error, response, body) {
				zipper.addFile("index.html", body);
				console.log("adding index…");
			
				tmp.dir({ unsafeCleanup: true }, function(err, zipdir) {
					if (err) { return cb(err); }

	//			console.log("zip: "+zipper.getEntries());
					var zipfile = path.resolve(zipdir,req.swagger.params.model.value+".zip");

					async.mapLimit(data.resources, 8, methodDocs, function (err, results) {
						console.log("Saving to "+zipfile);
						zipper.writeZip(zipfile);
						res.download(zipfile);
					});
				});
			});

		}
	}
	var zipper = new AdmZip();
				
  request.get(options, getModelDocs);
}