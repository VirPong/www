/**
 * Establishes the major functionality.
 */

var socket;
var wiiPut;


/**
 * The "document.addEventListener" contains reactions to information sent by the server.  
 */
document.addEventListener('DOMContentLoaded', function() {
	//The DOMContentLoaded event happens when the parsing of the current page
	//is complete. This means that it only tries to connect when it's done
	//parsing.
	  socket = io.connect('10.150.1.204:3000');
	  //when we receive any news, alert the user.
	  socket.on('news', function (data) {
	    alert(data);
	  });
	  socket.on('server-message', function(data){
		  alert(data);
	  });
});
function sendStuff(){
	alert("sending "+wiiPut);
	socket.emit('user-message', {data: wiiPut});
}
/**
 * Get input from a Wii Remote and store it in wiiPut (via a dialogue box).
 */
function get_wiiPut(){
	wiiPut = prompt("Give me wiiPut.");
}

/**
 * Display the current wiiPut in an alert box.
 */
function display_wiiPut(){
	alert("The wiiPut is "+wiiPut);
}
