/*@author Kyle Wenholz 
 * Contains user interface information, as well as communication to the 
 * server and the wiimote.
*/

var socket;

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
var xBall = gameX/2;
var yBall = gameY/2;

//Size of the ball
var ballR = gameX/20;

//Current score
var scoreLeft = 0;
var scoreRight = 0;

//Which paddle we are
var paddleID;

//Player names
var playerOneName = "P1";
var playerTwoName = "P2";

// Various flags 
var fieldStyleFlag;
var wiiFlag = false;
var authLooping = false;
 
//========================================================================
//========================================================================
//=============================DRAWING CODE===============================
//========================================================================
//========================================================================


/**
 * Starts the pong game & grabs the canvas so that we can modify it in JS.
 */
function initCanvas(){
    context = document.getElementById('gameCanvas').getContext('2d');
    context.canvas.width = window.innerWidth*(0.90);
    context.canvas.height = window.innerHeight*(0.75);
    screenModifierX = context.canvas.width/100;
    screenModifierY = context.canvas.height/100;
    
    var size = context.canvas.width;
    size = Math.floor(size*.04+.92);
    var font = String(size);
    
    context.fillStyle = "#ddd";
    var text = size+"px Silkscreen-Expanded";
    context.font = text;
    context.textBaseline = "top";
};

/**
 * Draws the game state.
 */
function draw(){
    context.clearRect(0,0, Math.floor(gameX*screenModifierX),
		      Math.floor(gameY*screenModifierY)); //clear the frame
    drawPaddles();
    //alert('clearRect2');
    drawBall();
    //alert('drawn');
    drawScore();
    drawHalfCourt();
};

/*
 * Draws a half court line.
 */
function drawHalfCourt() {
    var width = 3;
    var height = 3;
    var topY = 1.5*height;
    while(topY < gameY*screenModifierY - 1.5*height) {
        drawRect(gameX*screenModifierX/2 - .5*width, topY, width, height, 
		 'rgb(240,240,240)');
        topY = topY + 2*height;
    }
    
};

/**
 * Draws paddles based on the field positions.
 */
function drawPaddles() {   
    drawRect(0,
	     Math.floor(leftPad*screenModifierY),
	     Math.floor(paddleWidth*screenModifierX), 
             Math.floor(paddleHeight*screenModifierY), 
	     'rgb(240,240,240)');//xpos, ypos, width, height
    
    drawRect(Math.floor((gameX-paddleWidth)*screenModifierX),
	     Math.floor(rightPad*screenModifierY),
	     Math.floor(paddleWidth*screenModifierX),
             Math.floor(paddleHeight*screenModifierY), 
	     'rgb(240,240,240)');
};

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
    var tlX = (xBall*screenModifierX)-10;
    var tlY = (yBall*screenModifierY)-10;
    var brX = ballR*3;
    var brY = ballR*3;
    
    drawRect(tlX, tlY, brX, brY, 'rgb(240,240,240)');
};

/**
 * Draws current score on the canvas. 
 */
function drawScore(){
    var score;
    
    score = String(scoreLeft);
    context.fillText(playerOneName+": " + score, gameX*screenModifierX/5, 10);
    
    score = String(scoreRight);
    context.fillText(playerTwoName+": "+ score, 2.5*gameX*screenModifierX/4,10);
};	


//========================================================================
//========================================================================
//=============================SERVER CODE================================
//========================================================================
//========================================================================
/**
 * The 'document.addEventListener' contains reactions to information sent 
 * by the server.
 */
document.addEventListener('DOMContentLoaded', function() {
    // The DOMContentLoaded event happens when the parsing of 
    // the current page is complete. This means that it only tries to 
    //connect when it's done parsing.
    connectToServer();
});

/**
 * Sets up the connection to the server and registers multiple event listeners.
 */
function connectToServer(){	
    try{
   	socket = io.connect("10.150.1.204:3001"); 
    }catch(err){
   	alert("There was an error connecting to the server."+
   	     " Returning to the previous page.");
   	history.go(-1);
    }
    /** Updates the state of the game (basically coordinates). */
    socket.on('replayInfo', function(data){
	//expecting arrays for paddle1, paddle2, ballPos
        leftPad = Number(data.docs.paddle[0]);
        rightPad= Number(data.docs.paddle[1]);
        xBall = Number(data.docs.ball[0]);
        yBall = Number(data.docs.ball[1]);
	scoreLeft = Number(data.docs.scores[0]);
	scoreRight = Number(data.docs.scores[1]);
	draw();
    });
    /**When the server sends a room list, the player can pick a room or
       start a new one
       */
    socket.on('games', function(data){
	var gameList = "";
	for(i=0; i<data.names.length; i=i+1){
		gameList=gameList+"<a class=\"button\" onclick=\"viewGame(\'"+
		data.names[i]+"\');\">"+data.names[i]+"</a>";
	}
	displaySelection("selectGame", gameList);
    });
    /* A function for the end of a game. It notifies the player of whether
     he or she won/lost. */
    socket.on("gameEnd", function(data){
	resultString = "";
	if(scoreLeft<scoreRight){
	    if(paddleID == 0){
		displaySelection("gameEnd", "lost");
	    }else{
		displaySelection("gameEnd", "won");
	    }
	}else{
	    if(paddleID == 0){
		displaySelection("gameEnd", "won");
	    }else{
		displaySelection("gameEnd", "lost");
	    }
	}
    });
    /* A function for alerting the client when a disconnect occurs. */
    socket.on("disconnect", function(data){
	alert("You have been disconnected from the server! You will"+
	      " be returned to the previous page.");
	history.go(-1);
    });
};

/**
 * Select the room to join.
 *@param room a string representing the room name
 *@param clientType player or spectator as a string
 */
function viewGame(gameName){
    displaySelection("gameCanvas");
    socket.emit('watchGame', {game: gameName});
};

/**
 * Tells the server to make a room just for me.
 * @param {roomName} the name of the room to create
 */
function createRoom(roomName){
    socket.emit('createRoom', {name: roomName});
};

/**
 * Update our paddle position with the server.
 * @param {position} the new position of the paddle
 */
function updatePaddleToServer(position){
    socket.emit('paddleUpdate', {pos: position});
};

/**
 * Loads in login information from local storage to send to the server.
 */
function performAuthentication(){
    var username = localStorage.getItem("username");
    var pin = localStorage.getItem("pin");
    socket.emit("auth", {username: username, password: pin});
};

/**
 * Serves as a filter for various display options.  Game canvases,
 * buttons, input options, and even game end screens are initialized here.
 *@param {selection} a string representing the desired display: gameCanvas, 
 *	gameCanvasWithButtons, inputMethodSelection, selectRoom, newRoom, or gameEnd
 *@param {options} any of various options that go with {selection}
 */
function displaySelection(selection, options){    
    var view = document.getElementById("view");
    if(selection == "gameCanvas"){
	//A game canvas with no buttons
	view.innerHTML = "<canvas id=\"gameCanvas\" height=\"100\" "+
	    "width=\"100\"></canvas><br />";
	initCanvas();
    }else if(selection == "selectGame"){
	view.innerHTML = "<div id=\"mainWrapper\"><h1 align=\"center\">"+
	    "Which game do you want to view?</h1>"+ options+"</div>";
    }else if(selection == "gameEnd"){
	//A screen for the game finishing.  Also takes care of some cleanup.
	view.innerHTML == "The game is over."+
	    "<a align=\"center\" class=\"button\" onclick=\"\" "+
	    "href=\"index.html\">Return to the main screen.</a>";
    }
};
