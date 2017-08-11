let term = require('terminal-kit').terminal;
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		match_accounts(container)
			.then(function(container) {

				return upload(container)

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
function match_accounts(container)
{
	return new Promise(function(resolve, reject) {


		let matched = []

		container.sequr_users_email.forEach(function(sequr) {

			container.clean_users.forEach(function(service) {

				if(sequr == service.email)
				{
					matched.push({
						email: sequr,
						photo: service.photo
					});
				}

			});

		});

		console.log(matched)

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Ask the user for the URL of the site.
//
function upload(container)
{
	return new Promise(function(resolve, reject) {

				//
		//	-> Move to the next chain
		//
		return resolve(container);


	});
}