/*@author David Eva 
 * Contains user interface information, as well as communication to the server
 * and the wiimote.*/

//Username and password, apparently.
var name;
var pass;
//The canvas object handle.
var context;

// Sounds
//var paddleBounceSound = new Media("sounds/paddlebounce.wav");
//var wallBounceSound = new Media("sounds/wallbounce.wav");
//var losingSound = new Media("sounds/game_over.wav");
//var winningSound = new Media("sounds/domination.wav");

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

//Ball Velocity

var dx = 1;
var dy = 1;

//Size of the ball
var ballR = gameX/20;

//Current score
var scoreLeft = 0;
var scoreRight = 0;

//Which paddle we are
var paddleID;

var AI_SKILL = 1;
var AIturn = 0;

/**
 * Start the pong game & grab the canvas so that we can modify it in JS.
 */
function initClient(){
	context = gameCanvas.getContext("2d");
	context.canvas.width = window.innerWidth*(0.9);
	context.canvas.height = window.innerHeight*(0.83);
	screenModifierX = context.canvas.width/100;
	screenModifierY = context.canvas.height/100;
    
	var size = context.canvas.width;
	size = Math.floor(size*.04+.92);
	var font = String(size);
    
	context.fillStyle = "#ddd";
	var text = size+"px sans-serf";
	context.font = text;
	context.textBaseline = "top";
	
	startAccelerometer();
	setInterval(draw, 35);
};



//===============================================================================================
//===============================================================================================
//===================================PADDLE HANDLING CODE========================================
//===============================================================================================
//===============================================================================================


function AImove(){
	//var paddleJew = rightPad + .5(paddleHeight);  //middle of the paddle
	
	if(rightPad < yBall && AIturn == 0 && rightPad < (gameY - paddleHeight)){
		rightPad = rightPad + AI_SKILL;
	}
	else if(rightPad > yBall && AIturn == 0){
		rightPad = rightPad - AI_SKILL;
	}
}

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

//var playedSound = 0;
/**
 * Draws the game state.
 */
function draw(){
	context.clearRect(0,0, Math.floor(gameX*screenModifierX),Math.floor(gameY*screenModifierY)); //clear the frame
    
    if(scoreLeft == 3){
    	youWin();
    }
    else if(scoreRight == 3){
    	gameOver();
    }
    else{
    	drawPaddles();
		//alert('clearRect2');
		drawBall();
		//alert('drawn');
		drawScore();
    	drawHalfCourt();
    	ballLogic();
    	AImove();
    }
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
  	
    var ballMod = screenModifierY;
	drawRect(xBall*screenModifierX - .5*ballR*ballMod, yBall*screenModifierY - .5*ballR*screenModifierY, 2*ballR*ballMod, 
	2*ballR*ballMod, 'rgb(240,240,240)');
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

function gameOver(){
	//context.clearRect(0,0, Math.floor(gameX*screenModifierX),Math.floor(gameY*screenModifierY));
	var x = gameCanvas.width / 2;
    var y = gameCanvas.height / 2;
 
    context.font = "40pt Calibri";
    context.textAlign = "center";
    context.fillText("Game Over", x, y);
    //if(playedSound == 0){
	//	losingSound.play();
	//	playedSound = 1;
	//}
}
function youWin(){
	var x = gameCanvas.width / 2;
    var y = gameCanvas.height / 2;
 
    context.font = "40pt Calibri";
    context.textAlign = "center";
    context.fillText("You Win!!", x, y);
    //if(playedSound == 0){
	//	winningSound.play();
	//	playedSound = 1;
	//}
}


//===============================================================================================
//===============================================================================================
//========================================CLIENT SIDE BALL LOGIC=================================
//===============================================================================================
//===============================================================================================


function ballLogic(){

  //Ball bouncing logic
  
  if(yBall < 0 || yBall > gameY){
    dy = -dy; //change gBallPos[1] direction if you go off screen in y direction ....
  }
  
  // Paddle Boundary Logic
  
  // changed all these numbers to more reasonable also, these kinda stuff should also be fields but we can
  // think about that later
  
  if((xBall == paddleWidth + 1) && (yBall > leftPad - 3) && (yBall < (leftPad + paddleHeight + 3))){ //if it hits the left paddle
    dx = -dx; 
    AIturn = 0;
  }
  if((xBall == gameX - 4) && (yBall > rightPad - 3) && (yBall < (rightPad + paddleHeight + 3))){ //if it hits the right paddle
    dx = -dx;
    AIturn = 1;
  }
  
  // if ball goes out of frame reset in the middle and put to default speed and increment gScore...
  
  if(xBall < -10){ //changed these numbers you had old ones so ball was going super far out of frame
    xBall = gameX/2;
    yBall = gameY/2;
    dx = 1;
    dy = 1;
    scoreRight++;
    AIturn = 0;
    //sendScore();
  }
  if(xBall > gameX +10 ){ //changed these numbers you had old ones so ball was going super far out of frame
    xBall = gameX/2;
    yBall = gameY/2;
    dx = 1;
    dy = 1;
    scoreLeft++;
    AIturn = 0;
    //sendScore();
  }
  
  xBall+=dx;
  yBall+=dy;
};

//===============================================================================================
//===============================================================================================
//========================================Accelerometer Code=====================================
//===============================================================================================
//===============================================================================================


function startAccelerometer(){
	 // Set the frequency of refresh for Accelerometer data.
     var options = { frequency: 100 };
                
     // Start watching accerlation and point to it with watchID.
     var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);  
}

function onSuccess(acceleration)
    { 
     //var leftAccel = acceleration.y;
     //var rightAccel = acceleration.x;
    
        if(acceleration.x<-.03) { leftPad = leftPad + 5; }
        else if (acceleration.x>.03) { leftPad = leftPad - 5; }

    //rightPad = getPositionY(acceleration.x);
                
     }
            
/*
* Fires off an alert if there's an error in the collection of acceleration.
*/
function onError(acceleration) {
                
    alert('Error!');
}
            
     var currentAccelerationX = 0;
     var currentVelocityX = 0;
     var currentPositionX = 50;
            
     var previousAccelerationX = 0;
     var previousVelocityX = 0;
     //var previousPositionX = 0;
            
     var TIME = .4;
   
            
/*
* Calculates the position of the "paddle" given accelerometer data from tilt-action.
* @param   acceleration    The acceleration data (x,y,z,timestamp).
* @return  int position    An integer from 0 to 100 representing position.
*/
function getPositionX(acceleration) {
                
	currentAccelerationX = acceleration;
                
	var virtualAccelerationX = 2*currentAccelerationX;
                
	if((currentVelocityX<0&&currentAccelerationX>0) || (currentVelocityX>0&&currentAccelerationX<0)) {
                    
    	virtualAccelerationX = currentAccelerationX * 4;
                    
     }

     currentVelocityX = previousVelocityX + (TIME * virtualAccelerationX);

     var averageVelocityX = ((currentVelocityX) + (previousVelocityX)) / 2;
               
     currentPositionX = currentPositionX + (TIME * averageVelocityX);
     previousPositionX = currentPositionX;
                
     previousVelocityX = currentVelocityX;
     previousAccelerationX = currentAccelerationX;
                
     // Prevent us from going over 100 or under 0.
     if(currentPositionX>(100 - paddleHeight)) { currentPositionX = 100 - paddleHeight; }
     if(currentPositionX<0) { currentPositionX = 0; }
                
     if(currentPositionX==0||currentPositionX==(100 - paddleHeight)){ 
     	previousVelocityX = 0;
     	previousAccelerationX = 0;
     	currentVelocityX = 0;
     	currentAccelerationX = 0; 
     }
                
     return currentPositionX;
                
}

//Listen for keypresses as input methods
document.onkeydown = movePaddle;