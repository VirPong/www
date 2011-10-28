/**
* The file establishes server socket communication for gameplay.
* @author Kyle Wenholz
*/


var name;
var pass;



// The "document.addEventListener" contains reactions to information sent by the server.   
document.addEventListener("DOMContentLoaded", function() {
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
		 WHAT_PADDLE_AM_I = data.paddleNum; 
	  });
	  //Receives the game state from the server and draws the screen
	  socket.on("updateGame", function(data){//expecting arrays for paddle1, paddle2, ballPos
		 leftPad = data.paddle[0];
		 rightPad= data.paddle[1];
		 draw();
		 //draw(data.ballPos[0], data.ballPos[1]);
	  });
	  
	  //Sends client data
	  clientType();
	  //alert("I tried to do server stuff!");
	  p = new Pong();
	  p.draw(0, 0, 0, "rgb(0,200,0)");
});

/**
 * Alert the server of our player type.
 */
function clientType(){
	//alert("Sending client type");
	//emit sends information to the server. The data sent is a generic object that has a type property set to player
	socket.emit("clientType", {type: "player"});
};

/**
 * Informs the server that the paddle position has changed.
 * @param position
 */
function updatePaddle(position){
	//alert("update paddle");
	socket.emit("updatePaddle", {pos: position});
};

/**
 * Informs the server that a score has occured.
 */
function sendScore(){
	socket.emit("score", {left: scoreLeft, right: scoreRight});
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
		}
		var onFailure = function(){
			promptLogin();
		}
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
    }
    //actually send the request to the server
    xhr.send(null);
}