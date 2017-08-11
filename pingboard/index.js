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

				return get_something(container)

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

function get_something(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		let option = {
			url: "https://app.pingboard.com/oauth/token?grant_type=password",
		}

		//
		//  2.	Make a request to the Auth server to validate the token
		//
		request.post(option, function(error, response, body) {

			if(error)
			{
				return reject(error)
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