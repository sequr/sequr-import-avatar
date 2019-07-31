#!/usr/bin/env node

let npm = require('./package.json');
let term = require('terminal-kit').terminal;
let program = require('commander');
let request = require('request');

let upload = require('./sequr/upload');
let get_locations = require('./sequr/get_locations');
let get_sequr_users = require('./sequr/get_users');

let bamboohr = require('./bamboohr/index');
let pingboard = require('./pingboard/index');

//   _____   ______   _______   _______   _____   _   _    _____    _____
//  / ____| |  ____| |__   __| |__   __| |_   _| | \ | |  / ____|  / ____|
// | (___   | |__       | |       | |      | |   |  \| | | |  __  | (___
//  \___ \  |  __|      | |       | |      | |   | . ` | | | |_ |  \___ \
//  ____) | | |____     | |       | |     _| |_  | |\  | | |__| |  ____) |
// |_____/  |______|    |_|       |_|    |_____| |_| \_|  \_____| |_____/
//

//
//	The CLI options for this app. At this moment we just support Version
//
program
	.version(npm.version);

//
//	Just add an empty line at the end of the help to make the text more clear
//	to the user
//
program.on('--help', function() {
	console.log("");
});

//
//	Pass the user input to the module
//
program.parse(process.argv);

//
//	Listen for key preses
//
term.on('key', function(name, matches, data ) {

	//
	//	1.	If we detect CTR+C we kill the app
	//
	if(name === 'CTRL_C' )
	{
		//
		//	1. 	Lets make a nice user experience and clean the terminal window
		//		before closing the app
		//
		term.clear();

		//
		//	->	Kill the app
		//
		process.exit();
	}

});

//	 __  __              _____   _   _
//	|  \/  |     /\     |_   _| | \ | |
//	| \  / |    /  \      | |   |  \| |
//	| |\/| |   / /\ \     | |   | . ` |
//	| |  | |  / ____ \   _| |_  | |\  |
//	|_|  |_| /_/    \_\ |_____| |_| \_|
//

//
//	Before we start working, we clean the terminal window
//
term.clear();

//
//	The main container that will be passed around in each chain to collect
//	all the data and keep it in one place
//
let container = {}

//
//	Lets make a nice first impression
//
display_the_welcome_message(container)
	.then(function(container) {

		//
		//	Ask the user if they want to do a test run first
		//
		return ask_for_a_test_run(container);

	}).then(function(container) {

		//
		//	See if they want to do a test run first
		//
		if(!container.test_run)
		{
			return container;
		}

		//
		//	Ask for the size of the test run
		//
		return ask_for_test_run_size(container);

	}).then(function(container) {

		//
		//	Ask the user for the Sequr API Key
		//
		return ask_for_sequr_api_key(container);

	}).then(function(container) {

		//
		//	Using the Sequr API Key, get the list of locations that the user
		//	belongs to
		//
		return get_locations(container);

	}).then(function(container) {

		//
		//	Prepare the locations to be displayed as a menu selection
		//
		return prepare_the_location_array(container);

	}).then(function(container) {

		//
		//	Use the locations array to make a drop down menu
		//
		return select_location(container);

	}).then(function(container) {

		//
		//	Based on the selected location
		//
		return get_sequr_users(container);

	}).then(function(container) {

		//
		//	Ask the user which service do they use so we can ask them
		//	later for the right credential
		//
		return which_service_should_we_use(container);

	}).then(function(container) {

		//
		//	Make a nice header based on the user selection
		//
		return make_the_header(container);

	}).then(function(container) {

		//
		//	Load the BambooHR promises
		//
		if(container.selected_service === "BambooHR")
		{
			//
			//	->	Use this Promises
			//
			return bamboohr(container);
		}

		//
		//	Load the Pingboard promises
		//
		if(container.selected_service === "Pingboard")
		{
			//
			//	->	Use this Promises
			//
			return pingboard(container);
		}

	}).then(function(container) {

		//
		//	Use the service result to upload the photos
		//
		return upload(container);

	}).then(function(container) {

		//
		//	Get the names to display in the summary
		//
		return extract_only_matched_names(container);

	}).then(function(container) {

		//
		//	Show a summary of the work done
		//
		return display_the_sumary(container);

	}).then(function(container) {

		term("\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		term.clear();

		term("\n\n");

		//
		//	1.	Show the error message
		//
		term.red("\t" + error.message)

		term("\n\n");

		//
		//	->	Exit the app
		//
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
//	Draw on the screen a nice welcome message to show our user how
//	cool we are :)
//
function display_the_welcome_message(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Set the options that will draw the banner
		//
		let options = {
			flashStyle: term.brightWhite,
			style: term.brightCyan,
			delay: 20
		}

		//
		//	2.	The text to be displayed on the screen
		//
		let text = "\tStarting Sequr Import\n\nNOTE: Only users with email will import.";

		//
		//	3.	Draw the text
		//
		term.slowTyping(text, options, function() {

			term("\n");

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});


	});
}

//
//	Ask the user if they want to do a test run first with X users to see
//	if everything works
//
function ask_for_a_test_run(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		term.yellow('\tWould you like to do a test run? [N|y]');

		term("\n");

		//
		//	1.	Set how the prompt will behave, we want the default
		//		behavior not to run a test run
		//
		let options = {
			no: ['n', 'ENTER'],
			yes: ['y']
		};

		//
		//	2.	Ask the user what to do:
		//
		//		- Import all the photos
		//		- Or just a small part
		//
		term.yesOrNo(options, function(error, result) {

			//
			//	1.	Check if the result was positive
			//
			if(result)
			{
				//
				//	1.	Since the result is positive, we run a test
				//
				container.test_run = true;

			}

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Ask the user for the API Key of Sequr
//
function ask_for_test_run_size(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Use an external function to prompt the user for a number
		//
		ask_for_test_size(container, function(callback) {

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		})

	});
}

//
//	Ask the user for the API Key of Sequr
//
function ask_for_sequr_api_key(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease paste your Sequr API Key: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, api_key) {

			term("\n");

			term.yellow("\tLoading...");

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
//	Convert the locations that we received from Sequr in a simple array to
//	be used to draw the menu for the user to use to select a location.
//
//	This way we can show the user the name of the location and then actually
//	get the ID from his or her selection
//
function prepare_the_location_array(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	A temporary array
		//
		let tmp_array = [];

		//
		//	2.	Loop over the locations to just grab the name
		//
		container.locations.forEach(function(data) {

			//
			//	1.	Grab just the name
			//
			tmp_array.push(data.name);

		})

		//
		//	3.	Save the Locations for the next promise
		//
		container.items = tmp_array;

		//
		//	->	Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Display a drop down menu with a list of all the Locations for the given
//	user.
//
function select_location(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//	2.	Tell the user what we want from hi or her
		//
		term.yellow("\tSelect The Location ");

		term('\n');

		//
		//	3.	Draw the drop down menu
		//
		term.singleColumnMenu(container.items, options, function(error, res) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Get the Location name based on the user selection
			//
			const selected_location = container.locations[res.selectedIndex];

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.selected_location = selected_location;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Display a drop down menu with a list of all the Services that we support
//
function which_service_should_we_use(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//	2.	This are the services that we support at this moment
		//
		let services = [
			'BambooHR',
			'Pingboard'
		]

		//
		//	3.	Tell the user what we want from hi or her
		//
		term.yellow("\tSelect The Service ");

		term('\n');

		//
		//	4.	Draw the drop down menu
		//
		term.singleColumnMenu(services, options, function(error, response) {

			//
			//	1.	Get the Service name based on the user selection
			//
			let selected_service = services[response.selectedIndex]

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.selected_service = selected_service;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Clear everything and show a nice header to let the user know where or she
//	are
//
function make_the_header(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tService: " + container.selected_service);

		term("\n");

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Extract just the names of the effected users so we can display the names
//	in a summary
//
function extract_only_matched_names(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Loop over the matched accounts and take out only the
		//		name of the account since in the array we have the
		//		name and URL to the photo
		//
		let names = container.matched.reduce(function(array, data) {

			//
			//	1.	Push only the name to the array
			//
			array.push(data.name)

			//
			//	->	Return the new array for the next loop
			//
			return array;

		}, []);

		//
		//	2.	Save the names
		//
		container.matched_names = names;

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Show a nice summary of the process.
//
function display_the_sumary(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n\n");

		//
		//	1.	Let the user know that all went well :)
		//
		term.yellow("\tThe upload process was successful.");

		term("\n\n");

		term.yellow("\tSequr users with email : " + container.sequr_users_email.length);

		term("\n");

		term.yellow("\t" + container.selected_service + " users with email : " + container.clean_users.length);

		term("\n");

		term.yellow("\tMatched accounts: " + container.matched.length);

		term("\n\n");

		term.yellow("\tBellow you can find a full list of all the effected accounts: ");

		//
		//	2.	Specify the position from where the Terminal Kit should start
		//		drawing the Grid Menu.
		//
		let options = {
			x: 9,
			y: 11
		}

		//
		//	3.	Display the list of names that where effected
		//
		term.gridMenu(container.matched_names, options, function(error, response) {

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//  _    _   ______   _        _____    ______   _____     _____
// | |  | | |  ____| | |      |  __ \  |  ____| |  __ \   / ____|
// | |__| | | |__    | |      | |__) | | |__    | |__) | | (___
// |  __  | |  __|   | |      |  ___/  |  __|   |  _  /   \___ \
// | |  | | | |____  | |____  | |      | |____  | | \ \   ____) |
// |_|  |_| |______| |______| |_|      |______| |_|  \_\ |_____/
//

//
//	This function is used to ask the user how many users dose he want to effect
//	in a test run.
//
//	This code needed to be split an a separated function because we want to
//	validate the user input, so we need to block the progression until
//	they input a value bigger then 0.
//
function ask_for_test_size(container, callback)
{
		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tHow many employees would you like to effect?: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, raw_test_size) {

			term("\n");

			//
			//	1.	Convert the user input in to an integer
			//
			let test_size = parseInt(raw_test_size);

			//
			//	2.	Check if what the user entered is bigger then 0
			//
			if(isNaN(test_size) || test_size === 0)
			{
				return ask_for_test_size(container, callback);
			}

			//
			//	3.	Save the URL
			//
			container.test_size = test_size;

			//
			//	-> Move to the next chain
			//
			callback(container);

		});

}