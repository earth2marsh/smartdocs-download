# SmartDocs Export
A swagger-node based project to download the SmartDocs generated API documentation as a zip archive of HTML files.

To run, use `swagger project start` and follow the instructions.

(Still not working? Try running `sudo npm install -g swagger` and then `npm install`.)

Note: in order to have pretty filenames, use the `zipper.hbr` file to create a new index template in your model that uses relative urls and method names rather than uuids.

To do: 
* Check for existence of the `zipper` template, and create if necessary
* Remove the example hello-world request when the server starts