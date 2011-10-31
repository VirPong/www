/**
* The file establishes server socket communication for gameplay.
* @author Kyle Wenholz
* @author Jillian Andersen
*/

//Useful variables
var name;
var pass;
var pong;
var socket;
/**
 * The "document.addEventListener" contains reactions to information sent by the server.   
 */
document.addEventListener("DOMContentLoaded", function() {
	//alert("made pong");
	//The DOMContentLoaded event happens when the parsing of the current page
	//is complete. This means that it only tries to connect when it is done
	//parsing.
	  socket = io.connect("10.150.1.204:3000");
	  /*socket.on("gameStart", function (data) {//expecting a full start of game state
		  leftPad = data.paddle1;
		  rightPad = data.paddle2;
		  draw();
	  });*/
	  
	  //Alerts the user when a new score is submitted
	  socket.on("newScore", function(data){
		 alert(data);
	  });
	  //Gets a reference to which paddle the user is 
	  socket.on("paddleNum", function(data){
		 pong.WHAT_PADDLE_AM_I = data.paddleNum; 
	  });
	  //Receives the game state from the server and draws the screen
	  socket.on("updateGame", function(data){//expecting arrays for paddle1, paddle2, ballPos
		 pong.leftPad = data.paddle[0];
		 pong.rightPad= data.paddle[1];
		 pong.draw();
		 //draw(data.ballPos[0], data.ballPos[1]);
	  });
	  pong = new Pong(socket);
	  //Sends client data
	  clientType();
	  //alert("I tried to do server stuff!");
	  document.onkeydown = pong.movePaddle; //call movePaddle whenever any key is pressed
});

/**
* Alert the server of our player type.
*/
function clientType(){
	//alert("Sending client type");
	//emit sends information to the server. The data sent is a generic object that has a type property set to player
	this.socket.emit("clientType", {type: "player"});
};

/**
* Prompts the user for login
*/
function promptLogin(){
		name = prompt("Username please. (Use \"guest\" if you don't already have an account.");
		pass = prompt("Please enter your password. (If you are logging in as \"guest\" then please use \"pass\".)");
		//called when authentication was successful
		var onSuccess = function(){
			//Initialize the game!
		};
		var onFailure = function(){
			promptLogin();
		};
		authenticate(name, pass, onSuccess, onFailure);
			
}


function authenticate(user, pass, success, failure){
	var xhr = new XMLHttpRequest();
	xhr.open('get', 'http://cs340-serv/phonelogin.php?username=' + user + "&password=" + pass);
    //assign a handler for the response
    xhr.onreadystatechange = function(){
    	//check if the response has been received from the server
    	if(xhr.readyState == 4){
      		//read and assign the response from the server
        	var response = xhr.responseText;
			//gets rid of the spaces in response
        	response = response.replace(/^\s+|\s+$/g, '');
        	if(response === "0" || response === "1"){
        		failure();
        	}
        	else if (response === "2"){
        		success();
        	}
       
    	}
    };
    //actually send the request to the server
    xhr.send(null);
}