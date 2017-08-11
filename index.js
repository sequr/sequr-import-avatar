#!/usr/bin/env node

let npm = require('./package.json');
let term = require('terminal-kit').terminal;
let program = require('commander');
let request = require('request');
let get_properties = require(process.cwd() + '/sequr/get_properties');
let get_users = require(process.cwd() + '/sequr/get_users');

let bamboohq = require(process.cwd() + '/bamboohq/index');
let pingboard = require(process.cwd() + '/pingboard/index');

//
//	The CLI options for this app
//
program
	.version(npm.version)
	.option('-d, --david', 'The David');

//
//	Just add an empty line at the end of the help to make the text more clear to
//	the user
//
program.on('--help', function() {
	console.log("");
});

//
//	Pass the user input to the module
//
program.parse(process.argv);

//
//	Easter egg.
//
if(program.david)
{
	console.log('The David');
}

//	 __  __              _____   _   _
//	|  \/  |     /\     |_   _| | \ | |
//	| \  / |    /  \      | |   |  \| |
//	| |\/| |   / /\ \     | |   | . ` |
//	| |  | |  / ____ \   _| |_  | |\  |
//	|_|  |_| /_/    \_\ |_____| |_| \_|
//

term.clear();

let container = {}

//
//
//
setp_one(container)
	.then(function(container) {

		//
		//
		//
		return ask_for_sequr_api_key(container);

	}).then(function(container) {

		//
		//
		//
		return get_properties(container);

	}).then(function(container) {

		//
		//
		//
		return prepare_the_property_array(container);

	}).then(function(container) {

		//
		//
		//
		return select_property(container);

	}).then(function(container) {

		//
		//
		//
		return get_users(container);

	}).then(function(container) {

		//
		//
		//
		return which_service_should_we_use(container);

	}).then(function(container) {

		//
		//
		//
		if(container.selected_service === "BambooHQ")
		{
			//
			//
			//
			return bamboohq(container);
		}

		//
		//
		//
		if(container.selected_service === "Pingboard")
		{
			//
			//
			//
			return pingboard(container);
		}

	}).then(function(container) {

		term("\n");

		term("Done!")

		term("\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		term("\n");
		term("\n");
		console.log(error)
		term("\n");
		term("\n");

		process.exit();

	})

//  _____    _____     ____    __  __   _____    _____   ______    _____
// |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
// | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
// |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
// | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
// |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//
//
function setp_one(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//
		//
		let options = {
			flashStyle: term.brightWhite,
			style: term.brightCyan,
			delay: 50
		}

		//
		//
		//
		let text = "\tStarting Sequr Importer\n";

		//
		//
		//
		term.slowTyping(text, options, function() {

			term("\n");

			return resolve(container);

		});


	});
}

//
//	Ask the user for the URL of the site.
//
function ask_for_sequr_api_key(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease past the Sequr API Key: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, api_key) {

			//
			//	1.	Save the URL
			//
			container.sequr_api_key = api_key;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//
//
function prepare_the_property_array(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let tmp_array = [];

		//
		//
		//
		container.properties.forEach(function(data) {

			//
			//	1.	Get the size of the array, so we can prepend the name
			//		with a number to show the user ata glance how many options
			//		dose he have
			//
			let nr = tmp_array.length + 1;

			//
			//	2.	Construct the option name
			//
			let entry = nr + ". " + data.name

			//
			//	3.	Add the constructed option to the array to then be
			//		displayed
			//
			tmp_array.push(entry);

		})

		//
		//
		//
		container.items = tmp_array

		//
		//
		//
		return resolve(container);

	});
}

//
//
//
function select_property(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		let options = {
			leftPadding: "\t"
		}

		term('\n');

		term.yellow("\tSelect The Property ");

		term('\n');

		term.singleColumnMenu(container.items, options, function(error, response) {

			//
			//	1.	Get the folder name based on the user selection
			//
			let selected_property = container.properties[response.selectedIndex]

			term('\n');

			term.brightCyan("\t"+selected_property.name);

			container.selected_property = selected_property;

			return resolve(container);

		});

	});
}

//
//
//
function which_service_should_we_use(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		let options = {
			leftPadding: "\t"
		}

		let services = [
			'BambooHQ',
			'Pingboard'
		]

		term('\n');

		term.yellow("\tSelect The Service ");

		term('\n');

		term.singleColumnMenu(services, options, function(error, response) {

			//
			//	1.	Get the folder name based on the user selection
			//
			let selected_service = services[response.selectedIndex]

			//
			//
			//
			container.selected_service = selected_service;

			//
			//
			//
			return resolve(container);

		});

	});
}

//
//	Ask the user for the URL of the site.
//
function ask_for_the_servie_api_key(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease past the " + container.selected_service + " API Key: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, api_key) {

			//
			//	1.	Save the URL
			//
			container.sequr_api_key = api_key;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}