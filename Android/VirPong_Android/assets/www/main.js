/**
 * Displays a confirm box.
 */
function show_confirm()
{
	var r=confirm("Press a button");
	if (r==true){
		alert("You pressed OK!");
	}
	else{
		alert("You pressed Cancel!");
	}
}

/**
 * Login and play
 */
function play(){
	prompt("Give me your name!");
	window.location="pong.html";
}
//an example fetch
//  document.getElementById("platform").innerHTML = device.platform;