#!/usr/bin/env node

let npm = require('./package.json');
let program = require('commander');
let request = require('request');

//
//	The CLI options for this app
//
program
	.version(npm.version)
	.option('-d, --david', 'The David');

//
//	Just add an empty line at the end of the help to make the text more clear to
//	the user
//
program.on('--help', function() {
	console.log("");
});

//
//	Pass the user input to the module
//
program.parse(process.argv);

//
//	Easter egg.
//
if(program.david)
{
	console.log('The David');
}

