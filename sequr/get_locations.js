const request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Prepare the request
		//
		const option = {
			url: "https://api.sequr.io/v1/user/me/locations",
			json: true,
			headers: {
				Authorization: "Bearer " + container.sequr_api_key
			}
		}

		//
		//  2.	Make the request to get all the user locations
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
				let message = "Sequr request failed with message: "
							  + body.message;

				return reject(new Error(message));
			}

			//
			//	3.	Make an empty array where to store all the user locations
			//
			let locations = [];

			//
			//	4.	Loop over the result and save all the locations names
			//		in to the array
			//
			body.data.forEach(function(data) {

				//
				//	1.	Extract the name of the location
				//
				let location = {
					name: data.location.name,
					id: data.location.id,
					uuid:data.location.uuid,
					customer_uuid:data.location.customer_uuid
				}

				//
				//	2.	Add the name to the array
				//
				locations.push(location);

			});

			//
			//	5.	Save the locations for other promises to use
			//
			container.locations = locations;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});

};