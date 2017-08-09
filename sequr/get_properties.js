let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Prepare the request
		//
		let option = {
			url: "https://api.sequr.io/v1/user/me/properties",
			json: true,
			headers: {
				Authorization: "Bearer " + container.sequr_api_key
			}
		}

		//
		//  2.	Make the request to get all the user properties
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
			//	3.	Make an empty array where to store all the user properties
			//
			let properties = [];

			//
			//	4.	Loop over the result and save all the properties names
			//		in to the array
			//
			body.data.forEach(function(data) {

				//
				//	1.	Extract the name of the property
				//
				let name = data.property.name;

				//
				//	2.	Add the name to the array
				//
				properties.push(name);

			});

			//
			//	5.	Save the properties for other promises to use
			//
			container.properties = properties;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});

};