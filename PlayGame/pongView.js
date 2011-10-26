/**
 * Designs a class for displaying a Pong game.  This class is meant to work over a network, thus updates and 
 * such are pushed to the server and the display depends on information from the server.
 * 
 * @author David Eva
 * @author Kyle Wenholz
 */
(function(exports){
	
	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
		  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
	})();
	/**
	 * Constructor for the Pong environment.
	 */
	var Pong = function(){
		this.context = document.getElementById("gameCanvas").getContext("2d");//holds the canvas

		this.frameX = 210;
		this.frameY = 320;

		this.xBall=(frameX/2); //initial ball coords
		this.yBall=(frameY/2); //initial ball coords
		this.dx=1.2; //ball motion in x
		this.dy=2.5; //ball motion in y
		this.ballRadius = 10;

		this.paddleSize = frameY/8; //height
		this.paddleWidth = 10;
		this.leftPad = (frameY/2) - paddleSize/2; //yBall position of paddles init in the middle
		this.rightPad = (frameY/2) - paddleSize/2;

		this.motionStep = frameY/10; //reaction distance to a motion command

		this.scoreLeft = 0;
		this.scoreRight = 0;

		this.WHAT_PADDLE_AM_I;

		this.pieterMode = 0;
		
		this.WHITE = "rgb(248,248,245)";

		//this.pongSound = new Media("pong2.wav");
	};

	/**
	 * Moves a this player's paddle.
	 * @param {event object} e an event code from the system (likely a key press)
	 */
	Pong.movePaddle = function(e){
		var evntObj = (document.all)?event.keyCode:e.keyCode;
		//	var unicode = evntObj.charCode;
		var actualKey = String.fromCharCode(evntObj);
		//alert(evntObj + "\n" + actualKey);
		
		moveMyPaddle(actualKey);
		
		if(actualKey == "P"){
			pieterMode = (pieterMode + 1) % 2;
		}
	};
	
	/**
	 * Simulates paddle motion based on a key press.
	 * @param {string} actualKey a string representing a keypress
	 */
	Pong.movePaddle2 = function(actualKey){
		moveMyPaddle(actualKey);
		
		if(actualKey == "P"){
			pieterMode = (pieterMode + 1) % 2;
		}
	};
	
	/**
	 * Updates the paddle position then proceeds to notify the server that the position
	 * has changed. "W" is up and "S" is down.
	 * 
	 * @param {string} actualKey a string representing a keypress
	 */
	Pong.moveMyPaddle = function(actualKey){
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
			}
			if(actualKey == "S"){
				if(rightPad < (frameY - paddleSize)){
					rightPad = rightPad + motionStep;
				}
			}updatePaddle(rightPad);
		}
	};
	
	/**
	 * Draws the game state based on current values stored by the instance.
	 */
	Pong.draw = function(){
		context.clearRect(0,0, frameX,frameY); //clear the frame

		if(pieterMode == 1){
	       img = new Image();
	       img.src = "pieter.jpg";
	       context.drawImage(img, 0, 0,(img.width)/2 + 10, (img.height)/2 + 25);
		}
		drawRect(0,leftPad,paddleWidth, paddleSize, WHITE);//xpos, ypos, width, height
		drawRect(frameX-paddleWidth,rightPad,paddleWidth,paddleSize, WHITE);
		
		drawBall(xBall, yBall);
		drawScore();
	};
	
	/**
	 * Draws a rectangle based on the given parameters.
	 * @param {int} x x-coordinate of top left corner
	 * @param {int} y y-coordinate of top left corner
	 * @param {int} x2 x-coordinate of bottom right corner
	 * @param {int} y2 y-coordinate of bottom left corner
	 * @param {rgb color} col color of rectangle
	 */
	Pong.drawRect = function(x, y, x2, y2, col){
		context.save();

		context.beginPath();
		context.fillStyle = col; //color to fill shape in with
		context.rect(x,y,x2,y2); //draws rect with top left corner a,b
		context.closePath();
		context.fill();

		context.restore();
	};

	/**
	 * Draws the current state of the ball on the canvas.
	 */
	Pong.drawBall = function(){
		context.save();
		
		ballPaddleLogic();

		context.beginPath();
		context.fillStyle = "rgb(200,0,0)"; //color to fill shape in with
		
		context.arc(xBall,yBall,ballRadius,0,Math.PI*2,true);
		context.closePath();
		context.fill();
		
		context.restore();
	};

	/**
	 * Draws the score on the game field. 
	 */
	Pong.drawScore = function(){
		context.fillStyle = "#00f";
		context.font = "bold 50px sans-serif";
		context.textBaseline = "top";
		
		//draw each score
		var score;
		score = String(scoreLeft);
		context.fillText("Player 1: " + score, frameX/4, 10);
		var score;
		score = String(scoreRight);
		context.fillText("Player 2: " + score, (3*frameX/4),10);
	};

	/**
	 * Currently used to determine whether the ball needs to bounce or is in a scoring position.
	 */
	Pong.ballPaddleLogic = function(){
		
		//Ball bouncing logic
		
		if( yBall<0 || yBall>frameY){
			dy = -dy; //change yBall direction if you go off screen....
		}
		
		//Paddle Boundary Logic
		
		//changed all these numbers to more reasonable shit also, these kinda stuff should also be fields but we can
		//think about that later
		
		if((xBall <= 10) && (xBall > 5) && (yBall > leftPad) && (yBall < (leftPad + paddleSize))){ //if it hits the left paddle
			dx = -1.1*dx; //get faster after you hit it
		}
		if((xBall >= frameX - 10) && (xBall <= frameX - 5) && (yBall >= rightPad) && (yBall <= (rightPad + paddleSize))){ //if it hits the right paddle
			dx = -1.1*dx;
		}
		
		//if ball goes out of frame reset in the middle and put to default speed and increment score...
		
		if(xBall < -40){ //changed these numbers you had old ones so ball was going super far out of frame
			xBall = frameX/2;
			yBall = frameY/2;
			dx = 1;
			dy = 2;
			scoreRight++;
			sendScore();
		}
		if(xBall > 250){  //changed these numbers you had old ones so ball was going super far out of frame
			xBall = frameX/2;
			yBall = frameY/2;
			dx = 1;
			dy = 2;
			scoreLeft++;
			sendScore();
		}
		
		xBall+=dx;
		yBall+=dy;
	};

	document.onkeydown = movePaddle; //call movePaddle whenever any key is pressed
// Export to all scripts
exports.Pong = Pong;
//})(typeof global === "undefined" ? window : exports);
})(window);

