
var name;
var pass;
/**
 * The "document.addEventListener" contains reactions to information sent by the server.  
 */
document.addEventListener("DOMContentLoaded", function() {
	//The DOMContentLoaded event happens when the parsing of the current page
	//is complete. This means that it only tries to connect when it"s done
	//parsing.
	  socket = io.connect("10.150.1.204:3000");
	  /*socket.on("gameStart", function (data) {//expecting a full start of game state
		  leftPad = data.paddle1;
		  rightPad = data.paddle2;
		  draw();
	  });*/
	  socket.on("newScore", function(data){
		 alert(data);
	  });
	  socket.on("paddleNum", function(data){
		 WHAT_PADDLE_AM_I = data.paddleNum; 
	  });
	  socket.on("updateGame", function(data){//expecting arrays for paddle1, paddle2, ballPos
		 leftPad = data.paddle[0];
		 rightPad= data.paddle[1];
		 draw();
		 //draw(data.ballPos[0], data.ballPos[1]);
	  });
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

function promptLogin(){
		name = prompt("Username please. (Use \"guest\" if you don't already have an account.");
		pass = prompt("Please enter your password. (If you are logging in as \"guest\" then please use \"pass\".)");
}