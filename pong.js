/*@author Kyle Wenholz 
 * Contains user interface information, as well as communication to the server
 * and the wiimote.*/

//Username and password, apparently.
var name;
var pass;
//The canvas object handle.
var context;

//Standard 100x100 game space.
var gameX = 100;
var gameY = 100;

//Defining the screen modifiers.
var screenModifierX;
var screenModifierY;

//Positions of rightPad and leftPad
var rightPad = gameY/2;
var leftPad = gameY/2;

//Size of paddles.
var paddleWidth = 3;
var paddleHeight = gameY/5;

//Step motion size.
var motionStep = 10;

//Ball position.
var xBall = (gameX/2)+10;
var yBall = gameY/2;

//Size of the ball
var ballR = gameX/20;

//Current score
var scoreLeft = 0;
var scoreRight = 0;

//Which paddle we are
var paddleID;


/**
 * Start the pong game & grab the canvas so that we can modify it in JS.
 */
function initClient(){
	context = gameCanvas.getContext("2d");
	//alert("I initialized");
	context.canvas.width = window.innerWidth*(0.90);
	context.canvas.height = window.innerHeight*(0.70);
	screenModifierX = context.canvas.width/100;
	screenModifierY = context.canvas.height/100;
    
	var size = context.canvas.width;
	size = Math.floor(size*.04+.92);
	var font = String(size);
    
	context.fillStyle = "#ddd";
	var text = size+"px sans-serf";
	context.font = text;
	context.textBaseline = "top";
};



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
};


/**
 * Change the value of leftPaddle or rightPaddle so that it will draw in the correct place.
 *  @param {actualKey} The string value of the key pressed.
 */
function changePaddlePosition(actualKey) {
	if(paddleID == 0){
		if(actualKey == 'W'){ //check which key was pressed
			if(leftPad > 0){ // do nothing if it would move paddle out of frame
				leftPad = leftPad - motionStep;
			}
		}else if(actualKey == 'S'){
			if(leftPad < (gameY - paddleHeight)){
				leftPad = leftPad + motionStep;
			}
		}updatePaddleToServer(leftPad);
	}else{
		if(actualKey == 'W'){ //check which key was pressed
			if(rightPad > 0){ // do nothing if it would move paddle out of frame
				rightPad = rightPad - motionStep;
			}
		}if(actualKey == 'S'){
			if(rightPad < (gameY - paddleHeight)){
				rightPad = rightPad + motionStep;
			}
		}updatePaddleToServer(rightPad);
	}
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
	context.clearRect(0,0, Math.floor(gameX*screenModifierX),Math.floor(gameY*screenModifierY)); //clear the frame
    
    drawPaddles();
	//alert('clearRect2');
	drawBall();
	//alert('drawn');
	drawScore();
    drawHalfCourt();
};


/*
 * Draw the half court line.
 */
function drawHalfCourt() {
    
    var width = 3;
    var height = 3;
    var topY = 1.5*height;
    while(topY < gameY*screenModifierY - 1.5*height) {
        
        drawRect(gameX*screenModifierX/2 - .5*width, topY, width, height, 'rgb(240,240,240)');
        topY = topY + 2*height;
        
    }
    
}

function drawPaddles() {
    
    drawRect(0,Math.floor(leftPad*screenModifierY),Math.floor(paddleWidth*screenModifierX), 
             Math.floor(paddleHeight*screenModifierY), 'rgb(240,240,240)');//xpos, ypos, width, height
    
	drawRect(Math.floor((gameX-paddleWidth)*screenModifierX),Math.floor(rightPad*screenModifierY),Math.floor(paddleWidth*screenModifierX),
             Math.floor(paddleHeight*screenModifierY), 'rgb(240,240,240)');
    
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
};

/**
 * Draws the ball at current position.
 */
function drawBall(){

    //Draw square "ball"
    //context.save();
    //var tlX = (xBall*screenModifierX)-10;
    //var tlY = (yBall*screenModifierY)-10;
    //var brX = 20;
    //var brY = 20;
    //drawRect(tlX, tlY, brX, brY, 'rgb(240,240,240)');
  	//context.restore();
  	
    var ballMod = screenModifierX;
	if(screenModifierX > 8){
		ballMod = 8;
	};
	drawRect(xBall*screenModifierX - .5*ballR*ballMod, yBall*screenModifierY - .5*ballR*screenModifierY, 2*ballR*ballMod, 
	2*ballR*ballMod, 'rgb(255,255,255)');
};

/**
 * Draws current score on the canvas. 
 */
function drawScore(){
	var score;
	score = String(scoreLeft);
	context.fillText('P1: ' + score, gameX*screenModifierX/5, 10);
    
	var score;
	score = String(scoreRight);
	context.fillText('P2: ' + score, 2.5*gameX*screenModifierX/4,10);
};


//Listen for keypresses as input methods
document.onkeydown = movePaddle;



//===============================================================================================
//===============================================================================================
//========================================SERVER CODE============================================
//===============================================================================================
//===============================================================================================
/**
 * The 'document.addEventListener' contains reactions to information sent by the server.
 */
document.addEventListener('DOMContentLoaded', function() {
                          // The DOMContentLoaded event happens when the parsing of the current page
                          // is complete. This means that it only tries to connect when it's done
                          // parsing.
                          alert('preCon');
                          socket = io.connect("10.150.1.204:3000");
                          alert('postCon');
                          
                          performAuthentication();
                          
                          socket.on('paddleID', function(data){
                                    paddleID = data.paddleID;
                                    });
                          socket.on('gameState', function(data){//expecting arrays for paddle1, paddle2, ballPos
                                    //alert('update game');
                                    leftPad = data.paddle[0];
                                    rightPad= data.paddle[1];
                                    xBall = data.ball[0];
                                    yBall = data.ball[1];
                                    draw();
                                    // draw(data.ballPos[0], data.ballPos[1]);
                                    });
                          socket.on('scoreUpdate', function(data){
                                    scoreLeft = data.score[0];
                                    scoreRight = data.score[1];
                                    });
                          
                          socket.on('roomList', function(data){
                                    alert('received Room List');
                                    });
    
                          //alert the server of our player status
                          sendClientType('player');
                          });

/**
 * Alert the server of our client type.
 * @param playType player or spectator
 */
function sendClientType(playType){
	socket.emit('clientType', {type: playType});
};

/**
 * Update our paddle position with the server.
 * @param {position} the new position of the paddle
 */
function updatePaddleToServer(position){
	socket.emit('paddleUpdate', {pos: position});
};

/**
 * Asks the user for some login information and stores it for submission to the server.
 */
function performAuthentication(){
    
    var username = localStorage.getItem("username");
    var pin = localStorage.getItem("pin");
    
    /*var data = username + "|" + pin;
    
    socket.emit('userAuth', {authData: data});
    */
};
