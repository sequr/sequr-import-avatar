let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//
		//
		let option = {
			url: "https://google.com",
		}

		//
		//  5.	Make a request to the Auth server to validate the token
		//
		request.post(option, function(error, response, body) {

			if(error)
			{
				return reject(error)
			}

			container.properties = ['Green House', 'Mountain lake', 'Park On the Hill', 'Peache and quiet'];

			return resolve(container);

		})

	});

};