let term = require('terminal-kit').terminal;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		ask_for_username(container)
			.then(function(container) {

				return ask_for_password(container)

			}).then(function(container) {

				return get_the_api_key(container)

			}).then(function(container) {

				return get_the_users(container)

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
		term.yellow("\tPlease enter your username: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, username) {

			//
			//	1.	Save the URL
			//
			container.pingboard_username = username;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Ask the user for the URL of the site.
//
function ask_for_password(container)
{
	return new Promise(function(resolve, reject) {

		term('\n');

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease enter your password: ");

		//
		//	2.	Process the user input
		//
		term.inputField({}, function(error, password) {

			//
			//	1.	Save the URL
			//
			container.pingboard_password = password;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

function get_the_api_key(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		let option = {
			url: "https://app.pingboard.com/oauth/token?grant_type=password",
			json: true
		}

		//
		//  2.	Make a request to the Auth server to validate the token
		//
		request.post(option, function(error, response, body) {

			if(error)
			{
				return reject(error)
			}

			if(response.statusCode >= 300)
			{
				return reject(new Error(response.statusCode));
			}

			//
			//
			//
			container.service_api_key = body.access_token

			//
			//
			//
			return resolve(container);

		}).form({
			username: container.pingboard_username,
			password: container.pingboard_password
		});

	});
}

function get_the_users(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	The basic parameters to get the list of user for the given
		//		company
		//
		let queries = {
			include: "linked_accounts,groups",
			page_size: "100",
			page: "1",
			sort: "id"
		}

		//
		//	2.	Prepare the query to get a all the user of a company
		//
		let option = {
			url: "https://app.pingboard.com/api/v2/users",
			json: true,
			qs: queries,
			auth: {
				bearer: container.service_api_key
			}
		}

		//
		//  3.	Make a request to the Auth server to validate the token
		//
		request.get(option, function(error, response, data) {

			if(error)
			{
				return reject(error)
			}

			if(response.statusCode >= 300)
			{
				return reject(new Error(response.statusCode));
			}

			//
			//
			//
			container.employee = data.users;

			//
			//
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
		container.employee.forEach(function(data) {

			//
			//	1.	Add what we care to the tmp array
			//
			tmp_array.push({
				email: data.email,
				photo: data.avatar_urls.original
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
		delete container.employee;

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}