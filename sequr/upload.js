let term = require('terminal-kit').terminal;
let https = require('https');
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

		//
		//
		//
		container.matched = matched;

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
		//
		//
		container.matched.forEach(function(data) {

			//
			//
			//
			download(data.photo, function(photo) {

				//
				//	2.	Prepare the request
				//
				let option = {
					url: "https://api.sequr.io/v1/property_user/" + container.selected_property.id + "/avatar",
					json: true,
					headers: {
						Authorization: "Bearer " + container.sequr_api_key
					},
					formData: {
						avatar: {
							value: photo,
							options: {
								filename: 'name.jpg'
							}
						}
					}
				}

				//
				//  3.	Make the request to get all the user properties
				//
				request.put(option, function(error, response, body) {

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

					console.log(body)

					//
					//	-> Move to the next chain
					//
					return resolve(container);

				});

			});

		});

	});
}

function download(url, callback)
{
		//
		//	1.	The tmp file where to save the repo so we can modify
		//		the content of the archive.
		//
		let file = [];

		//
		//	2.	Download the file.
		//
		https.get(url, function(res) {

			//
			//	1.	Keep on writing to the open file in the TMP dir.
			//
			res.on('data', function(data) {

				//
				//	1.	Write data in to the file.
				//
				file.push(data);


			});

			//
			//	2.	Close the file and on once the file is 100% downloaded.
			//
			res.on('end', function() {

				let buffer = Buffer.concat(file);

				callback(buffer);

			});

		});
}