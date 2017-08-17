let term = require('terminal-kit').terminal;
let https = require('https');
let request = require('request');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Look for matching emails
		//
		match_accounts(container)
			.then(function(container) {

				//
				//	1.	Upload the avatars for the matching emails
				//
				return upload(container)

			}).then(function(container) {

				//
				//	->	Move to the next chain
				//
				return resolve(container)

			}).catch(function(error) {

				//
				//	->	Crash if something goes wrong
				//
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
//	Based on all the data that we have accumulated until now we can now loop
//	over all the email from both sides and see which one matches
//
function match_accounts(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Keep all the matched email in one place
		//
		let matched = []

		//
		//	2.	Loop over all the Sequr emails
		//
		container.sequr_users_email.forEach(function(sequr) {

			//
			//	1.	Check every Sequr email against all the email from
			//		the selected service
			//
			container.clean_users.forEach(function(service) {

				//
				//	1.	Compare the emails
				//
				if(sequr.email == service.email)
				{
					//
					//	1.	If a match is found we save two important values
					//
					//		-	The ID of the user
					//		-	The URL from the service that we select to the
					//			uaser avatar.
					//
					matched.push({
						id: sequr.id,
						photo: service.photo
					});
				}

			});

		});

		//
		//	3.	Save the matched emails
		//
		container.matched = matched;

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Now that we have all the matched emails we can loop over all of them and
//	send to the server all the avatars for the selected users
//
function upload(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Loop over all the matched emails
		//
		container.matched.forEach(function(data) {

			//
			//	1.	Download the avatar from the remote server
			//
			download_image(data.photo, function(photo) {

				//
				//	1.	Create the URL to use to upload the avatar
				//
				let url = "https://api.sequr.io/v1/property_user/"
						  + data.id
						  + "/avatar"

				//
				//	2.	Prepare the request where the data is going to be
				//		sent as a multi part form request so we can attach
				//		the image.
				//
				//		WARNING
				//
				//		You are probably wondering why the `filename` is
				//		present, well. It needs to be there otherwise the
				//		module will flip out and crash.
				//
				//		So, never remove and never change :)
				//
				let option = {
					url: url,
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
				//  3.	Make the request
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

					//
					//	-> Move to the next chain
					//
					return resolve(container);

				});

			});

		});

	});
}

//  _    _   ______   _        _____    ______   _____     _____
// | |  | | |  ____| | |      |  __ \  |  ____| |  __ \   / ____|
// | |__| | | |__    | |      | |__) | | |__    | |__) | | (___
// |  __  | |  __|   | |      |  ___/  |  __|   |  _  /   \___ \
// | |  | | | |____  | |____  | |      | |____  | | \ \   ____) |
// |_|  |_| |______| |______| |_|      |______| |_|  \_\ |_____/
//

//
//	This function allows you to download a remote file and store it in memory
//	as a buffer.
//
function download_image(url, callback)
{
	//
	//	1.	The tmp file where to save the repo so we can modify
	//		the content of the archive.
	//
	let buffers_chunks = [];

	//
	//	2.	Download the file.
	//
	https.get(url, function(res) {

		//
		//	1.	Keep on writing to the open file in the TMP dir.
		//
		res.on('data', function(buffer) {

			//
			//	1.	Write data in to the file.
			//
			buffers_chunks.push(buffer);

		});

		//
		//	2.	Close the file and on once the file is 100% downloaded.
		//
		res.on('end', function() {

			//
			//	1.	Combine all the buffer chunks that we got from the remote
			//		server in to one big buffer which is going to represent
			//		the whole file.
			//
			let file = Buffer.concat(buffers_chunks);

			//
			//	->	Pass the file to whoever is waiting for it.
			//
			callback(file);

		});

	});
}
