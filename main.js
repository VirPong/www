/**
 * Establishes the major functionality of the app.  This basically amounts to connecting with the server.
 */

var socket;
var wiiPut;
/**
 * Get input from a Wii Remote and store it in wiiPut (via a dialogue box).
 */
function getWiiPut(){
	wiiPut = prompt("Give me wiiPut.");
}

/**
 * Display the current wiiPut in an alert box.
 */
function displayWiiPut(){
	alert("The wiiPut is "+wiiPut);
}

function iMaMac(){
	
}
