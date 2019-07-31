let term = require('terminal-kit').terminal;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Prompt for the user name which in this case is the email
		//
		display_pingboard_note(container)
			.then(function(container) {

				//
				//	1.	Just the password
				//
				return ask_for_username(container)

			})		
			.then(function(container) {

				//
				//	1.	Just the password
				//
				return ask_for_password(container)

			}).then(function(container) {

				//
				//	1.	Make a query to pinboard to get a Access Token
				//
				return get_the_api_key(container)

			}).then(function(container) {

				//
				//	1.	Query for all the user of the company
				//
				return get_the_users(container)

			}).then(function(container) {

				//
				//	1.	Keep only the data from the response that we need
				//
				return discard_unnecesary_data(container)

			}).then(function(container) {

				//
				//	->	Move to the next chain
				//
				return resolve(container)

			}).catch(function(error) {

				//
				//	->	Stop on error
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
//	Draw on the screen a message that pingboard only allows two plan TEAM 
//	and Company for this imports
//
function display_pingboard_note(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Notice to pingboard users
		//
		term.red("\tNOTE: It will only work with Pingboard's TEAM and Company plan.\n");

		term("\n");

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Prompt for the user which is the email
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
//	Prompt for the password
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
		//	2.	Enable password input mode, meaning the character will be
		//		dotted out.
		//
		let options = {
			echoChar: true
		}

		//
		//	3.	Process the user input
		//
		term.inputField(options, function(error, password) {

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

//
//	After we have the user name and password we can make a query to Pinboard to
//	ask for a temporary Access Token. Sadly this is the only way to get
//	access to a company account - Pinboard doesn't support API Keys
//
//	So this is the only way as of now.
//
function get_the_api_key(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Prepare the options for the request
		//
		let option = {
			url: "https://app.pingboard.com/oauth/token?grant_type=password",
			json: true
		}

		//
		//  2.	Make the request
		//
		request.post(option, function(error, response, body) {

			//
			//	1.	Check if there was an internal error
			//
			if(error)
			{
				return reject(error)
			}

			//
			//	2.	Check if we got a negative response
			//
			if(response.statusCode >= 300)
			{
				let message = "Pingboard request failed with status code: "
							  + response.statusCode

				let error = new Error(message);

				return reject(error);
			}

			//
			//	3.	Save the Access Token for the next chain
			//
			container.service_api_key = body.access_token

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		}).form({
			username: container.pingboard_username,
			password: container.pingboard_password
		});

	});
}

//
//	Query for all the users of a given company
//
function get_the_users(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	The basic parameters to get the list of user for the given
		//		company
		//
		let queries = {
			include: "",
			page_size: 3000,
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
		//  3.	Make the request
		//
		request.get(option, function(error, response, data) {

			//
			//	1.	Check if there was an internal error
			//
			if(error)
			{
				return reject(error)
			}

			//
			//	2.	Check if we got a negative response
			//
			if(response.statusCode >= 300)
			{
				return reject(new Error(response.statusCode));
			}

			//
			//	3.	Save all the users for the next chain
			//
			container.employee = data.users;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Go over the result that we got back, and keep only the data that we
//	actually need, which in this case is the:
//
//	- email
//	- photo
//
function discard_unnecesary_data(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Hold the final data in tmp array
		//
		let tmp_array = [];

		//
		//	2.	Loop over the result and traverse the JSON that we got back
		//
		container.employee.forEach(function(data) {

			//
			//	1.	Add what we care to the tmp array
			//
			if(data.email){

				tmp_array.push({
					email: data.email,
					photo: data.avatar_urls.original
				});

			}
			
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