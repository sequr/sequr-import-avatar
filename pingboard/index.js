let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		let container = {}

		//
		//
		//
		get_something(container)
			.then(function(container) {

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

function get_something(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		let option = {
			url: "https://sequr.io",
		}

		//
		//  2.	Make a request to the Auth server to validate the token
		//
		request.post(option, function(error, response, body) {

			if(error)
			{
				return reject(error)
			}

			container.where_was_i = "pingboard"

			return resolve(container);

		})

	});
}