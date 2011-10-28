/**
 * Designs a class for displaying a Pong game.  This class is meant to work over a network, thus updates and 
 * such are pushed to the server and the display depends on information from the server.
 * 
 * @author David Eva
 * @author Kyle Wenholz
 */

(function(exports){
	/**
	 * Constructor for the Pong environment.
	 */
	var Pong = function(updatePaddle, sendScore){
		//FIELDS
		this.sendScore = sendScore;//function to send score to server
		this.updatePaddle = updatePaddle;//function for telling the server to update the paddle
		this.context = document.getElementById("gameCanvas").getContext("2d");//holds the canvas
	
		this.frameX = 210;
		this.frameY = 320;
	
		this.xBall=(this.frameX/2); //initial ball coords
		this.yBall=(this.frameY/2); //initial ball coords
		this.dx=1.2; //ball motion in x
		this.dy=2.5; //ball motion in y
		this.ballRadius = 10;
	
		this.paddleSize = this.frameY/8; //height
		this.paddleWidth = 10;
		this.leftPad = (this.frameY/2) - this.paddleSize/2; //yBall position of paddles init in the middle
		this.rightPad = (this.frameY/2) - this.paddleSize/2;
	
		this.motionStep = this.frameY/10; //reaction distance to a motion command
	
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
	Pong.prototype.movePaddle = function(e){
		var evntObj = (document.all)?event.keyCode:e.keyCode;
		//	var unicode = evntObj.charCode;
		var actualKey = String.fromCharCode(evntObj);
		//alert(evntObj + "\n" + actualKey);
		
		this.moveMyPaddle(actualKey);
		
		if(actualKey == "P"){
			this.pieterMode = (this.pieterMode + 1) % 2;
		}
	};
	
	/**
	 * Simulates paddle motion based on a key press.
	 * @param {string} actualKey a string representing a keypress
	 */
	Pong.prototype.movePaddle2 = function(actualKey){
		this.moveMyPaddle(actualKey);
		
		if(actualKey == "P"){
			this.pieterMode = (this.pieterMode + 1) % 2;
		}
	};
	
	/**
	 * Updates the paddle position then proceeds to notify the server that the position
	 * has changed. "W" is up and "S" is down.
	 * 
	 * @param {string} actualKey a string representing a keypress
	 */
	Pong.prototype.moveMyPaddle = function(actualKey){
		if(this.WHAT_PADDLE_AM_I == 0){
			if(actualKey == "W"){ //check which key was pressed
				if(this.leftPad > 0){ // do nothing if it would move paddle out of frame
					this.leftPad = this.leftPad - this.motionStep;
				}
			}
			if(actualKey == "S"){
				if(this.leftPad < (this.frameY - this.paddleSize)){
					this.leftPad = this.leftPad + this.motionStep;
				}
			}this.updatePaddle(this.leftPad);
		}else{
			if(actualKey == "W"){ //check which key was pressed
				if(this.rightPad > 0){ // do nothing if it would move paddle out of frame
					this.rightPad = this.rightPad - this.motionStep;
				}
			}
			if(actualKey == "S"){
				if(this.rightPad < (this.frameY - this.paddleSize)){
					this.rightPad = this.rightPad + this.motionStep;
				}
			}this.updatePaddle(this.rightPad);
		}
	};
	
	/**
	 * Draws the game state based on current values stored by the instance.
	 */
	Pong.prototype.draw = function(){
		this.context.clearRect(0,0, this.frameX,this.frameY); //clear the frame
	
		if(this.pieterMode == 1){
	       var img = new Image();
	       img.src = "pieter.jpg";
	       this.context.drawImage(img, 0, 0,(img.width)/2 + 10, (img.height)/2 + 25);
		}
		this.drawRect(0,this.leftPad,this.paddleWidth, this.paddleSize, this.WHITE);//xpos, ypos, width, height
		this.drawRect(this.frameX-this.paddleWidth,this.rightPad,this.paddleWidth,this.paddleSize, this.WHITE);
		
		this.drawBall(this.xBall, this.yBall);
		this.drawScore();
	};
	
	/**
	 * Draws a rectangle based on the given parameters.
	 * @param {int} x x-coordinate of top left corner
	 * @param {int} y y-coordinate of top left corner
	 * @param {int} x2 x-coordinate of bottom right corner
	 * @param {int} y2 y-coordinate of bottom left corner
	 * @param {rgb color} col color of rectangle
	 */
	Pong.prototype.drawRect = function(x, y, x2, y2, col){
		this.context.save();
	
		this.context.beginPath();
		this.context.fillStyle = col; //color to fill shape in with
		this.context.rect(x,y,x2,y2); //draws rect with top left corner a,b
		this.context.closePath();
		this.context.fill();
	
		this.context.restore();
	};
	
	/**
	 * Draws the current state of the ball on the canvas.
	 */
	Pong.prototype.drawBall = function(){
		this.context.save();
		
		this.ballPaddleLogic();
	
		this.context.beginPath();
		this.context.fillStyle = "rgb(200,0,0)"; //color to fill shape in with
		
		this.context.arc(this.xBall,this.yBall,this.ballRadius,0,Math.PI*2,true);
		this.context.closePath();
		this.context.fill();
		
		this.context.restore();
	};
	
	/**
	 * Draws the score on the game field. 
	 */
	Pong.prototype.drawScore = function(){
		this.context.fillStyle = "#00f";
		this.context.font = "bold 50px sans-serif";
		this.context.textBaseline = "top";
		
		//draw each score
		var score;
		score = String(scoreLeft);
		this.context.fillText("Player 1: " + score, this.frameX/4, 10);
		score = String(scoreRight);
		this.context.fillText("Player 2: " + score, (3*this.frameX/4),10);
	};
	
	/**
	 * Currently used to determine whether the ball needs to bounce or is in a scoring position.
	 */
	Pong.prototype.ballPaddleLogic = function(){
		
		//Ball bouncing logic
		
		if( this.yBall<0 || this.yBall>this.frameY){
			this.dy = -this.dy; //change yBall direction if you go off screen....
		}
		
		//Paddle Boundary Logic
		
		//changed all these numbers to more reasonable shit also, these kinda stuff should also be fields but we can
		//think about that later
		
		if((this.xBall <= 10) && (this.xBall > 5) && (this.yBall > this.leftPad) && (this.yBall < (this.leftPad +
				this. paddleSize))){ //if it hits the left paddle
			this.dx = -1.1*this.dx; //get faster after you hit it
		}
		if((this.xBall >= this.frameX - 10) && (this.xBall <= this.frameX - 5) && (this.yBall >= this.rightPad) 
				&& (this.yBall <= (this.rightPad + this.paddleSize))){ //if it hits the right paddle
			this.dx = -1.1*this.dx;
		}
		
		//if ball goes out of frame reset in the middle and put to default speed and increment score...
		
		if(this.xBall < -40){ //changed these numbers you had old ones so ball was going super far out of frame
			this.xBall = this.frameX/2;
			this.yBall = this.frameY/2;
			this.dx = 1;
			this.dy = 2;
			this.scoreRight++;
			this.sendScore(this.scoreLeft, this.scoreRight);
		}
		if(xBall > 250){  //changed these numbers you had old ones so ball was going super far out of frame
			this.xBall = this.frameX/2;
			this.yBall = this.frameY/2;
			this.dx = 1;
			this.dy = 2;
			this.scoreLeft++;
			this.sendScore(this.scoreLeft, this.scoreRight);
		}
		
		this.xBall+=this.dx;
		this.yBall+=this.dy;
	};
	
	//The "document.addEventListener" contains reactions to information sent by the server.   
	document.addEventListener("DOMContentLoaded", function() {
		var p = new Pong();
		p.draw();
		document.onkeydown = p.movePaddle; //call movePaddle whenever any key is pressed
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
		  alert("I tried to do server stuff!");
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
// Export to all scripts
exports.Pong = Pong;
//})(typeof global === "undefined" ? window : exports);
})(window);