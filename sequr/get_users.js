let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	Query Sequr to get all the user for the selected Property
		//
		get_all_the_users(container)
			.then(function(container) {

				//
				//	Extract from the response only what we need
				//
				return extract_just_the_email(container)

			}).then(function(container) {

				//
				//	->	Move to the next chain
				//
				return resolve(container);

			}).catch(function(error) {

				//
				//	->	Stop on error
				//
				return reject(error);

			})

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
//	Get all the user from the selected property
//
function get_all_the_users(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Options for the URL
		//
		let queries = {
			page_size: 1000,
			page: "1",
			order_by: "user_name"
		}

		//
		//	2.	Prepare the request
		//
		let option = {
			url: "https://users-api.sequr.io/v1/property/" + container.selected_property.id + "/property_user",
			json: true,
			qs: queries,
			headers: {
				Authorization: "Bearer " + container.sequr_api_key
			}
		}

		//
		//  3.	Make the request to get all the user from the selected
		//  	properties.
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
				let message = "Sequr request failed with message: "
							  + body.message;

				return reject(new Error(message));
			}

			//
			//	3.	Save the response before cleaning out what we need
			//
			container.raw_users = body.data;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	From the response we actually need only the emails to then use to match
//	with the emails and user IDs from a selected Service
//
function extract_just_the_email(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	An array where to put the emails in
		//
		let tmp_users = [];

		//
		//	2.	Go over the response and get the emails and IDs
		//
		container.raw_users.forEach(function(data) {

			//
			//	1.	Push a small object with just what we need to our
			//		temporary array
			//
			tmp_users.push({
				id: data.id,
				email: data.user.email,
				name: data.user.name
			});

		});

		//
		//	3.	Remove from memory the response that we got from Sequr since
		//		there is a lot of unnecessary data there.
		//
		//			Be mindful of users computers
		//
		delete container.raw_users;

		//
		//	4.	Add our tiny data to the container so other promises
		//		can then use the.
		//
		container.sequr_users_email = tmp_users;

		//
		//	->	Move to the next chain
		//
		return resolve(container);

	});
}