let term = require('terminal-kit').terminal;
let https = require('https');
let request = require('request');

let progress_bar = "";

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		//
		//	1.	Look for matching emails
		//
		match_accounts(container)
			.then(function(container) {

				//
				//	1.	Check first if we have a match
				//
				return check_if_there_was_any_match(container)

			}).then(function(container) {

				//
				//	1.	Slice the array of matched people for a test run
				//
				return slice_the_array_if_in_demo_mode(container)

			}).then(function(container) {

				//
				//	1.	Upload the avatars for the matching emails
				//
				return start_the_upload_process(container)

			}).then(function(container) {

				//
				//	->	Move to the next chain
				//
				return resolve(container)

			}).catch(function(error) {

				//
				//	->	Crash if something goes wrong
				//
				return reject(error)

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
						photo: service.photo,
						name: sequr.name
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
//	Before we start some serious action, lets check if there was at least one
//	match.
//
function check_if_there_was_any_match(container)
{
	return new Promise(function(resolve, reject) {

		if(container.matched.length == 0)
		{
			//
			//	-> Stop the app and show the error
			//
			return reject(new Error("Sorry, no matches found"));
		}

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});

}

//
//	Before we start some serious action, lets check if there was at least one
//	match.
//
function slice_the_array_if_in_demo_mode(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Check if the user entered a size limit for the amount of
		//		matched user to process
		//
		if(container.test_size)
		{

			//
			//	1. Create a temporary array to hold the sliced array
			//
			let sliced = [];

			//
			//	2.	Get the elements from the top
			//
			sliced = container.matched.slice(0, container.test_size);

			//
			//	3.	Remove the rest of the matched user since we don't
			//		need them anymore
			//
			delete container.matched;

			//
			//	4.	Preserve the sliced
			//
			container.matched = sliced;
		}

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});

}

//
//	Start the upload process which will wait until all the async work will be
//	done.
//
function start_the_upload_process(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Display a nice banner letting the user know what to expect
		//		during this step since this part will take quite a
		//		while depending on:
		//
		//		- Internet speed.
		//		- Image resolution.
		//		- Amount of images.
		//
		term.clear();

		term("\n");

		term.brightWhite("\tSit back and relax.");

		term("\n");

		term.brightWhite("\tNo more information will be require from you.");

		term("\n");

		term.brightWhite("\tEnjoy the progress...");

		term("\n");
		term("\n");

		//
		//	2.	Calculate how many account were matched
		//
		let matched_size = container.matched.length;

		//
		//	3.	Create the Progress Bar here because at this point will know
		//		how many users do we have to process.
		//
		progress_bar = term.progressBar({
			width: 80,
			title: '\tUploading photos:',
			percent: true,
			eta: true,
			items: matched_size
		});

		//
		//	4.	Once we know which users match, we can start the upload process
		//
		return upload(container, matched_size, function() {

			//
			//	1.	Set a delay before we resolve the promise to give the
			//		progress bar time to display the Done message.
			//
			setTimeout(function() {

				//
				//	->	Move to the next chain
				//
				return resolve(container);

			}, 700);

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
//	This is a recurring function which is used to upload photos in a way that
//	will make the promise wait for the execution. Meaning we can loop with
//	promises over a regular array. And still keep track of the progress
//	of this operation, which is crucial to show a nice progress bar to
//	the user.
//
function upload(container, length, callback)
{
	//
	//	1.	Detect when there are no more user to process. If this is the
	//		case we exit the loop and go back to the original promise that
	//		called this function
	//
	if(!length)
	{
		return callback();
	}

	//
	//	2.	Decrees the amount of accounts to process
	//
	length--;

	//
	//	3.	Get and remove one element from the array
	//
	let element = container.matched[length];

	//
	//	4.	Tell the progress bar to start and display the name of the
	//		user that is being processed.
	//
	progress_bar.startItem(element.name);

	//
	//	5.	Download the avatar from the remote server
	//
	download_image(element.photo, function(photo) {

		//
		//	1.	Create the URL to use to upload the avatar
		//
		let url = "https://api.sequr.io/v1/property_user/"
				  + element.id
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
			//	3.	Once we know that the image was successfully uploaded
			//		we can notify the progress bar to get ready for the next
			//		tick.
			//
			progress_bar.itemDone(element.name);

			//
			//	-> Move to the next chain
			//
			return upload(container, length, callback);

		});

	});

}

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
