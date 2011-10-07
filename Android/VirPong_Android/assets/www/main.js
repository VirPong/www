var wiiPut;
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