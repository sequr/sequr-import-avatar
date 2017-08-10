let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		get_all_the_users(container)
			.then(function(container) {

				//
				//
				//
				return extract_just_the_email(container)

			}).then(function(container) {

				//
				//
				//
				return resolve(container);

			}).catch(function(error) {

				//
				//
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
//
//
function get_all_the_users(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		let queries = {
			page_size: "100",
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
		//  3.	Make the request to get all the user properties
		//
		request.get(option, function(error, response, body) {

			//
			//	1.	Check if there were no internal errors
			//
			if(error)
			{
				return reject(error)
			}

			//
			//	2. Check if the server didn't have any issues
			//
			if(response.statusCode >= 300)
			{
				return reject(new Error(body.message))
			}

			//
			//	5.	Save the properties for other promises to use
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
//
//
function extract_just_the_email(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let tmp_users = [];

		//
		//
		//
		container.raw_users.forEach(function(data) {

			tmp_users.push(data.user.email);

		});

		//
		//
		//
		container.sequr_users_email = tmp_users;

		//
		//
		//
		return resolve(container);

	});
}












