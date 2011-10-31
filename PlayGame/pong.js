//Username and password, apparently.
var name;
var pass;

//The canvas object handle.
var context;

//Standard 100x100 game space.
var gameX;
var gameY;

//Defining the screen modifiers.
var screenModifierX;
var screenModifierY;

//Positions of rightPad and leftPad
var rightPad = gameY/2;
var leftPad = gameY/2;

//Size of paddles.
var paddleWidth = gameX/20;
var paddleHeight = gameY/5;

//Step motion size.
var motionStep = gameY/10;

//Ball position.
var xBall = gameX/2;
var yBall = gameY/2;

//Size of the ball
var ballR = gameX/15;

//Current score
var scoreLeft = 0;
var scoreRight = 0;

//Which paddle we are
var WHAT_PADDLE_AM_I;


/**
 * Start the pong game & grab the canvas so that we can modify it in JS.
 */
function initClient(){
	context=document.getElementByID("gameCanvas").getContext("2d");
	context.canvas.width = window.innerWidth*(0.9);
	context.canvas.height = window.innerHeight*(0.9);


	screenModifierX = context.canvas.width/100;
	screenModifierY = context.canvas.height/100;
}



//===============================================================================================
//===============================================================================================
//===================================PADDLE HANDLING CODE========================================
//===============================================================================================
//===============================================================================================

/**
 * Receive the input and send it to changePaddlePosition(), which actually changes the paddle position.
 * @param {e} the event passed by the keypress.
 */
function movePaddle(e) {
	var evntObj = (document.all)?event.keyCode:e.keyCode;
	var actualKey = String.fromCharCode(evntObj);
	changePaddlePosition(actualKey);
}


/**
 * Change the value of leftPaddle or rightPaddle so that it will draw in the correct place.
 *  @param {actualKey} The string value of the key pressed.
 */
function changePaddlePosition(actualKey) {
	if(WHAT_PADDLE_AM_I == 0){
		if(actualKey == "W"){ //check which key was pressed
			if(leftPad > 0){ // do nothing if it would move paddle out of frame
				leftPad = leftPad - motionStep;
			}
		}
		if(actualKey == "S"){
			if(leftPad < (frameY - paddleHeight)){
				leftPad = leftPad + motionStep;
			}
		}updatePaddleToServer(leftPad);
	}else{
		if(actualKey == "W"){ //check which key was pressed
			if(rightPad > 0){ // do nothing if it would move paddle out of frame
				rightPad = rightPad - motionStep;
			}
		}if(actualKey == "S"){
			if(rightPad < (frameY - paddleHeight)){
				rightPad = rightPad + motionStep;
			}
		}updatePaddleToServer(rightPad);
	}
}

/**
 * Update our paddle position with the server.
 * @param {position} the new position of the paddle
 */
function updatePaddleToServer(position){
	// alert("update paddle");
	socket.emit("updatePaddle", {pos: position});
};

//===============================================================================================
//===============================================================================================
//========================================DRAWING CODE===========================================
//===============================================================================================
//===============================================================================================

/**
 * Draws the game state.
 */
function draw(){


	context.clearRect(0,0, gameX.screenModifierX,gameY.screenModifierY); //clear the frame


	drawRect(0,leftPad*screenModifierY,paddleWidth*screenModifierX, paddleHeight*screenModifierY, "rgb(0,200,0)");//xpos, ypos, width, height
	drawRect((gameX-paddleWidth)*screenModifierX,rightPad*screenModifierY,paddleWidth*screenModifierX,paddleHeight*screenModifierY, "rgb(255,0,0)");


	drawBall(xBall, yBall);


}

/**
 * Draws rectangles on the canvas.
 * @param a top-left x-position
 * @param b top-left y-position
 * @param c bottom-right x-position
 * @param d bottom-right y-position
 * @param col color of the paddle
 */
function drawRect(a, b, c, d, col){
	context.save();


	context.beginPath();
	context.fillStyle = col; //color to fill shape in with
	context.rect(a,b,c,d); //draws rect with top left corner a,b
	context.closePath();
	context.fill();


	context.restore();
}

/**
 * Draws the ball at current position.
 */
function drawBall(){
	context.save();


//	ballPaddleLogic();


	context.beginPath();
	context.fillStyle = "rgb(200,0,0)"; //color to fill shape in with


	context.arc(xBall*screenModifierX,yBall*screenModifierY,ballR*screenModifierX,0,Math.PI*2,true);
	context.closePath();
	context.fill();

	context.restore();
}

/**
 * Draws current score on the canvas. 
 */
function drawScore(){
	context.fillStyle = "#00f";
	context.font = "bold 50px sans-serif";
	context.textBaseline = "top";

	var score;
	score = String(scoreLeft);
	context.fillText("Player 1: " + score, gameX*screenModifierX/4, 10);

	var score;
	score = String(scoreRight);
	context.fillText("Player 2: " + score, 3*gameX*screenModifierX/4,10);

}
//Listen for keypresses as input methods
document.onkeydown = movePaddle;


/**
 * The "document.addEventListener" contains reactions to information sent by the server.
 */
document.addEventListener("DOMContentLoaded", function() {
	// The DOMContentLoaded event happens when the parsing of the current page
	// is complete. This means that it only tries to connect when it"s done
	// parsing.
	socket = io.connect("10.150.1.204:3000");
	/*socket.on("gameStart", function (data) {//expecting a full start of game state
                           leftPad = data.paddle1;
                           rightPad = data.paddle2;
                           draw();
                           });*/
	socket.on("sendScore", function(data){
        scoreLeft = data[0];
        scoreRight = data[1];
    });
	socket.on("paddleNum", function(data){
		WHAT_PADDLE_AM_I = data.paddleNum;
	});
	socket.on("updateGame", function(data){//expecting arrays for paddle1, paddle2, ballPos
		leftPad = data.paddle[0];
		rightPad= data.paddle[1];
		xBall = data.ballPos[0];
		yBall = data.ballPos[1];
		draw();
		// draw(data.ballPos[0], data.ballPos[1]);
	});
	//alert the server of our player status
	clientType();
});


/**
 * Alert the server of our player type.
 */
function clientType(){
	// alert("Sending client type");
	socket.emit("clientType", {type: "player"});
};

/**
 * Update our paddle position with the server.
 * @param {position} the new position of the paddle
 */
function updatePaddle(position){
	// alert("update paddle");
	socket.emit("updatePaddle", {pos: position});
};

/**
 * Asks the user for some login information and stores it for submission to the server.
 */
function promptLogin(){
	name = prompt("Username please. (Use \"guest\" if you don't already have an account.");
	pass = prompt("Please enter your password. (If you are logging in as \"guest\" then please use \"pass\".)");
};

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
var name;
var pass;

var context;//holds the canvas

var screenModifierX = window.innerWidth-100;
var screenModifierY = window.innerHeight-100;


var frameX = window.innerWidth-100;
var frameY = window.innerHeight-100;

var xBall=(frameX/2); //initial ball coords
var yBall=(frameY/2); //initial ball coords
var dx=1.2; //ball motion in x
var dy=2.5; //ball motion in y
var ballRadius = 10;

var paddleSize = frameY/8; //height
var paddleWidth = 10;
var leftPad = (frameY/2) - paddleSize/2; //yBall position of paddles init in the middle
var rightPad = (frameY/2) - paddleSize/2;

var motionStep = frameY/10; //reaction distance to a motion command

var scoreLeft = 0;
var scoreRight = 0;

var WHAT_PADDLE_AM_I;

var pieterMode = 0;

//var media = new Media("pong2.wav");

/**
 * Start the pong game by grabbing the canvas.
 */
function initClient(){
	context= document.getElementById("gameCanvas").getContext("2d");
	context.canvas.width = window.innerWidth-100;
	context.canvas.height = window.innerHeight-100;


}

/**
 * Move the paddle as a response to input.
 * @param e 
 */
function movePaddle(e){
	var evntObj = (document.all)?event.keyCode:e.keyCode;
//	var unicode = evntObj.charCode;
	var actualKey = String.fromCharCode(evntObj);
//	alert(evntObj + "\n" + actualKey);


	moveMyPaddle(actualKey);


	if(actualKey == "P"){
		pieterMode = (pieterMode + 1) % 2;
	}
};

function movePaddle2(actualKey){
	moveMyPaddle(actualKey);


	if(actualKey == "P"){
		pieterMode = (pieterMode + 1) % 2;
	}
};

function moveMyPaddle(actualKey){
	if(WHAT_PADDLE_AM_I == 0){
		if(actualKey == "W"){ //check which key was pressed
			if(leftPad > 0){ // do nothing if it would move paddle out of frame
				leftPad = leftPad - motionStep;
			}
		}
		if(actualKey == "S"){
			if(leftPad < (frameY - paddleSize)){
				leftPad = leftPad + motionStep;
			}
		}updatePaddle(leftPad);
	}else{
		if(actualKey == "W"){ //check which key was pressed
			if(rightPad > 0){ // do nothing if it would move paddle out of frame
				rightPad = rightPad - motionStep;
			}
		}if(actualKey == "S"){
			if(rightPad < (frameY - paddleSize)){
				rightPad = rightPad + motionStep;
			}
		}updatePaddle(rightPad);
	}
}

/**
 * Draws the game state.
 */
function draw(){


	context.clearRect(0,0, frameX,frameY); //clear the frame


	if(pieterMode == 1){
		img = new Image();
		img.src = "pieter.jpg";
		context.drawImage(img, 0, 0,(img.width)/2 + 10, (img.height)/2 + 25);
	}
	drawRect(0,leftPad,paddleWidth, paddleSize, "rgb(0,200,0)");//xpos, ypos, width, height
	drawRect(frameX-paddleWidth,rightPad,paddleWidth,paddleSize, "rgb(255,0,0)");


	drawBall(xBall, yBall);
}

/**
 * Draws rectangles on the canvas.
 * @param a top-left x-position
 * @param b top-left y-position
 * @param c bottom-right x-position
 * @param d bottom-right y-position
 * @param col color of the paddle
 */
function drawRect(a, b, c, d, col){
	context.save();


	context.beginPath();
	context.fillStyle = col; //color to fill shape in with
	context.rect(a,b,c,d); //draws rect with top left corner a,b
	context.closePath();
	context.fill();


	context.restore();
}

/**
 * Draws the ball at given position.
 */
function drawBall(){
	context.save();


//	ballPaddleLogic();


	context.beginPath();
	context.fillStyle = "rgb(200,0,0)"; //color to fill shape in with


	context.arc(xBall,yBall,ballRadius,0,Math.PI*2,true);
	context.closePath();
	context.fill();


	context.restore();
}

/**
 * Draws a score on the canvas. 
 */
function drawScore(){
	context.fillStyle = "#00f";
	context.font = "bold 50px sans-serif";
	context.textBaseline = "top";


	var score;
	score = String(scoreLeft);
	context.fillText("Player 1: " + score, frameX/4, 10);


	var score;
	score = String(scoreRight);
	context.fillText("Player 2: " + score, 3*frameX/4,10);


}

/**
 * Runs logic for the paddle.  This determines bounces and scores.
 */
function ballPaddleLogic(){


//	Ball bouncing logic


	if( yBall<0 || yBall>frameY){
		dy = -dy; //change yBall direction if you go off screen....
	}


	// Paddle Boundary Logic


	// changed all these numbers to more reasonable shit also, these kinda stuff should also be fields but we can
	// think about that later


	if((xBall <= 10) && (xBall > 5) && (yBall > leftPad) && (yBall < (leftPad + paddleSize))){ //if it hits the left paddle
		dx = -1.1*dx; //get faster after you hit it
	}
	if((xBall >= frameX - 10) && (xBall <= frameX - 5) && (yBall >= rightPad) && (yBall <= (rightPad + paddleSize))){ //if it hits the right paddle
		dx = -1.1*dx;
	}


	// if ball goes out of frame reset in the middle and put to default speed and increment score...


	if(xBall < -40){ //changed these numbers you had old ones so ball was going super far out of frame
		xBall = frameX/2;
		yBall = frameY/2;
		dx = 1;
		dy = 2;
		scoreRight++;
		sendScore();
	}
	if(xBall > 250){ //changed these numbers you had old ones so ball was going super far out of frame
		xBall = frameX/2;
		yBall = frameY/2;
		dx = 1;
		dy = 2;
		scoreLeft++;
		sendScore();
	}


	xBall+=dx;
	yBall+=dy;
}

document.onkeydown = movePaddle; //call movePaddle whenever any key is pressed

/**
 * The "document.addEventListener" contains reactions to information sent by the server.
 */
document.addEventListener("DOMContentLoaded", function() {
	// The DOMContentLoaded event happens when the parsing of the current page
	// is complete. This means that it only tries to connect when it"s done
	// parsing.
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
		xBall = data.ballPos[0];
		yBall = data.ballPos[1];
		draw();
		// draw(data.ballPos[0], data.ballPos[1]);
	});
	clientType();
});

/**
 * Alert the server of our player type.
 */
function clientType(){
	// alert("Sending client type");
	socket.emit("clientType", {type: "player"});
};

/**
 * Update our paddle position with the server.
 * @param {position} the new position of the paddle
 */
function updatePaddle(position){
	// alert("update paddle");
	socket.emit("updatePaddle", {pos: position});
};

/**
 * Sends a new score to the server.
 */
function sendScore(){
	socket.emit("score", {left: scoreLeft, right: scoreRight});
};

/**
 * Asks the user for some login information.
 */
function promptLogin(){
	name = prompt("Username please. (Use \"guest\" if you don't already have an account.");
	pass = prompt("Please enter your password. (If you are logging in as \"guest\" then please use \"pass\".)");
}