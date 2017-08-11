let term = require('terminal-kit').terminal;
let xml2js = require('xml2js').parseString;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		ask_for_username(container)
			.then(function(container) {

				return get_something(container)

			}).then(function(container) {

				return convert_xml_to_json(container)

			}).then(function(container) {

				return discard_unnecesary_data(container)

			}).then(function(container) {

				return resolve(container)

			}).catch(function(error) {

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
//	Ask the user for the URL of the site.
//
function ask_for_username(container)
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

function get_something(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		let option = {
			url: "https://api.bamboohr.com/api/gateway.php/sequr/v1/employees/directory",
		}

		//
		//  2.	Make a request to the Auth server to validate the token
		//
		request.get(option, function(error, response, body) {

			//
			//
			//
			if(error)
			{
				return reject(error)
			}

			//
			//
			//
			container.employee_xml = body;

			//
			//
			//
			return resolve(container);

		}).auth(container.service_api_key, 'x', true)

	});
}

function convert_xml_to_json(container)
{
	return new Promise(function(resolve, reject) {

		xml2js(container.employee_xml, function(error, employee_json) {

			if(error)
			{
				return reject(error);
			}

			//
			//
			//
			container.employee_json = employee_json;

			//
			//
			//
			return resolve(container);

		});

	});
}

function discard_unnecesary_data(container)
{
	return new Promise(function(resolve, reject) {

		let tmp_array = [];

		container.employee_json.directory.employees.forEach(function(data) {
			data.employee.forEach(function(something, index) {

				tmp_array.push({
					email: something.field[8]["_"],
					photo: something.field[14]["_"]
				})

			});

		});

		//
		//
		//
		container.clean_users = tmp_array

		//
		//
		//
		return resolve(container);

	});
}