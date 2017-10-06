let term = require('terminal-kit').terminal;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Ask for the API Key
		//
		ask_for_the_api_key(container)
			.then(function(container) {

				//
				//	1.	Ask for the company name
				//
				return ask_for_the_company_name(container)

			}).then(function(container) {

				//
				//	1.	Get the company user database
				//
				return get_company_users(container)

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
				return reject(error)

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
		term.yellow("\tPlease enter your BambooHR API Key: ");

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
//	Ask the user for the name of the company that they have created on
//	BambooHR. We have to do this because BambooHR is not inferring the
//	name of the company based on the API Key alone.
//
function ask_for_the_company_name(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease enter BambooHR sub-domain: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, company_name) {

			//
			//	1.	Save the URL
			//
			container.company_name = company_name;

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
		//	1.	The basic options for the request.
		//
		let option = {
			url: "https://api.bamboohr.com/api/gateway.php/" + container.company_name + "/v1/employees/directory",
			json: true,
			headers: {
				Accept: 'application/json'
			}

		}

		//
		//  2.	Make a request
		//
		request.get(option, function(r_error, response, body) {

			//
			//	1.	Check if there were no internal errors
			//
			if(r_error)
			{
				return reject(r_error);
			}

			//
			//	2. Check if the server didn't have any issues
			//
			if(response.statusCode >= 300)
			{
				let message = "BambooHR request failed with status code: "
							  + response.statusCode

				let error = new Error(message);

				return reject(error);
			}

			//
			//	3.	Save the raw body which is just pure XML - deal with it.
			//
			container.employees = body.employees;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		}).auth(container.service_api_key, 'x', true)

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
		container.employees.forEach(function(data) {

			//
			//	1.	Add what we care to the tmp array
			//
			tmp_array.push({
				email: data.workEmail,
				photo: data.photoUrl
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
		delete container.employees;

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}