let term = require('terminal-kit').terminal;
let xml2js = require('xml2js').parseString;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Ask for the API Key
		//
		ask_for_the_api_key(container)
			.then(function(container) {

				//
				//	1.	Get the company user database
				//
				return get_company_users(container)

			}).then(function(container) {

				//
				//	1.	Yes... convert XML to JSON - no joke
				//
				return convert_xml_to_json(container)

			}).then(function(container) {

				//
				//	1.	Save only the data that we need, which is:
				//
				//		- email
				//		- url to avatar
				//
				return discard_unnecesary_data(container)

			}).then(function(container) {

				//
				//	->	Move to the next chain
				//
				return resolve(container)

			}).catch(function(error) {

				//
				//	->	Crash if something goes wrong
				//
				return reject(container)

			});

	});
};

//  _____    _____     ____    __  __   _____    _____   ______    _____
// |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
// | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
// |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
// | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
// |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//	Ask for the API Key that the user can generate in their account
//
function ask_for_the_api_key(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease enter your Bamboo API Key: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, api_key) {

			//
			//	1.	Save the URL
			//
			container.service_api_key = api_key;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Retrieve every employee for a specific account
//
function get_company_users(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	The basic options for the request, since we are getting XML
		//		no JSON flag is needed ;) we just get a nice txt file of XML.
		//
		let option = {
			url: "https://api.bamboohr.com/api/gateway.php/sequr/v1/employees/directory",
		}

		//
		//  2.	Make a request
		//
		request.get(option, function(error, response, body) {

			//
			//	1.	Check if there were no internal errors
			//
			if(error)
			{
				console.log(error);
			}

			//
			//	2. Check if the server didn't have any issues
			//
			if(response.statusCode >= 300)
			{
				console.log(body.message);
			}

			//
			//	3.	Save the raw body which is just pure XML - deal with it.
			//
			container.employee_xml = body;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		}).auth(container.service_api_key, 'x', true)

	});
}

//
//	There is no good way to do this and no good module to do this because
//	well XML can be formated in 100 different ways. So to write a parser
//	that would take in consideration every possibility is... well a daunting
//	task.
//
//	xml2js is not perfect, but at least you get something that can be used.
//
function convert_xml_to_json(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Parse the XML in to JSON
		//
		xml2js(container.employee_xml, function(error, employee_json) {

			//
			//	1. Check for internal errors
			//
			if(error)
			{
				return reject(error);
			}

			//
			//	2.	Save the converted data
			//
			container.employee_json = employee_json;

			//
			//	3.	Delete the XML data since we won't need it anymore to
			//		be mindful of the user memory since, this array could hold
			//		a bunch of megabytes
			//
			delete container.employee_xml;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Keep only the data that we care about
//
function discard_unnecesary_data(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Hold the final data in tmp array
		//
		let tmp_array = [];

		//
		//	2.	Loop over the result and traverse the convoluted JSON that we
		//		got back
		//
		container.employee_json.directory.employees.forEach(function(data) {

			data.employee.forEach(function(something, index) {

				//
				//	1.	Add what we care to the tmp array
				//
				tmp_array.push({
					email: something.field[8]["_"],
					photo: something.field[14]["_"]
				})

			});

		});

		//
		//	3. Save the result
		//
		container.clean_users = tmp_array

		//
		//	4.	Delete the JSON data since we won't need it anymore to
		//		be mindful of the user memory since, this array could hold
		//		a bunch of megabytes
		//
		delete container.employee_json;

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}