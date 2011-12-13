/*@author Kyle Wenholz 
 * Contains user interface information, as well as communication to the 
 * server and the wiimote.
*/

//Username and password.
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
var xBall = gameX/2;
var yBall = gameY/2;

//Size of the ball
var ballR = gameX/20;

//Current score
var scoreLeft = 0;
var scoreRight = 0;

//Which paddle we are
var paddleID;

// Event identifiers. For sound effects.
var NOEVENT = 0;
var WALLBOUNCE = 1;
var PADDLEBOUNCE = 2;


// Sounds
//var paddleBounceSound = new Media('sounds/paddlebounce.wav');
//var wallBounceSound = new Media('sounds/wallbounce.wav');

/**
 * Starts the pong game & grabs the canvas so that we can modify it in JS.
 */
function initCanvas(){
    context = gameCanvas.getContext("2d");
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

 
//========================================================================
//========================================================================
//=============================DRAWING CODE===============================
//========================================================================
//========================================================================


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
    context.fillText('P1: ' + score, gameX*screenModifierX/5, 10);
    
    var score;
    score = String(scoreRight);
    context.fillText('P2: ' + score, 2.5*gameX*screenModifierX/4,10);
};	


//========================================================================
//========================================================================
//==============================EVENT CODE================================
//========================================================================
//========================================================================

/**
 * Performs actions related to the wall bounce event.
 */
function eventController(eventCode){
    if(eventCode == NOEVENT);
    if(eventCode == PADDLEBOUNCE){
        paddleBounceEvent();
    }
    if(eventCode == WALLBOUNCE){
        wallBounceEvent();
    }
};
/**
 * Performs actions related to the wall bounce event.
 */
function wallBounceEvent(){
    wallBounceSound.play();   
};
/**
 * Performs actions related to the paddle bounce event.
 */
function paddleBounceEvent(){
    paddleBounceSound.play();
};


//========================================================================
//========================================================================
//==============================INPUT CODE================================
//========================================================================
//========================================================================

/**
 * Initializes the appropriate input methods for playing a game.
 * @param {method} a string for the desired input method. 
 * "K" = Keyboard
 * "T" = Touchscreen
 * "W" = Wii Remote
 * "A" = Local Accelerometer
**/
function handleInputSelect(method){
    if(method == "keys"){
	document.onkeydown = movePaddle;
    }if(method == "touchscreen"){
	//DRAW THE BUTTONS
	alert("You selected touchscreen.");
    }if(method == "wii"){
	alert("You selected Wii Remote.");
	document.onkeydown = movePaddle;
    }if(method == "localAccel"){
	//XXXX Hook into the accelerometer stuff
	alert("You picked local accelerometer.");
    }
    connectToServer();
};

/**
 * Receive the input and send it to changePaddlePosition(), which actually 
 * changes the paddle position.
 * @param {e} the event passed by the keypress.
 */
function movePaddle(e) {
	var evntObj = (document.all)?event.keyCode:e.keyCode;
	var actualKey = String.fromCharCode(evntObj);
	changePaddlePosition(actualKey);
};


/**
 * Change the value of leftPaddle or rightPaddle so that it will draw in 
 * the correct place.  This method is for a string input.  "W" is down and
 * "S" is up. 
 *  @param {actualKey} The string value of the key pressed.
 */
function changePaddlePosition(actualKey) {
    if(paddleID == 0){
	if(actualKey == 'W'){ //check which key was pressed
	    if(leftPad > 0){ 
		// do nothing if it would move paddle out of frame
		leftPad = leftPad - motionStep;
	    }
	}else if(actualKey == 'S'){
	    if(leftPad < (gameY - paddleHeight)){
	    	leftPad = leftPad + motionStep;
	    }
	}updatePaddleToServer(leftPad);
	}else{
	    if(actualKey == 'W'){ //check which key was pressed
		if(rightPad > 0){ 
		    // do nothing if it would move paddle out of frame
		    rightPad = rightPad - motionStep;
		}
	    }if(actualKey == 'S'){
		if(rightPad < (gameY - paddleHeight)){
		    rightPad = rightPad + motionStep;
		}
	    }updatePaddleToServer(rightPad);
	}		
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
//XXXX We need to fix this to not be an onload event.  Maybe a button?
document.addEventListener('DOMContentLoaded', function() {
    // The DOMContentLoaded event happens when the parsing of 
    // the current page is complete. This means that it only tries to 
    //connect when it's done parsing.
    displaySelection("inputMethodSelection");
    performAuthentication();
});

function connectToServer(){	
    try{
	socket = io.connect("10.150.1.204:3000");
    }catch(err){
	alert("There was an error connecting to the server."+
	     " Returning to the previous page.");
	history.go(-1);
    }
    socket.on('paddleID', function(data){
	if(data.paddleID == 0){
	    alert("You are the left paddle.");
	}else{
	    alert("You are the right paddle.");
	}
	paddleID = data.paddleID;
	displaySelection("gameCanvas");
    });
    /** Updates the state of the game (basically coordinates). */
    socket.on('gameState', function(data){
	//expecting arrays for paddle1, paddle2, ballPos
        leftPad = data.paddle[0];
        rightPad= data.paddle[1];
        xBall = data.ball[0];
        yBall = data.ball[1];
        eventController(data.gameEvent); // eventController executes events
        draw();
    });
    socket.on('scoreUpdate', function(data){
	scoreLeft = data.score[0];
        scoreRight = data.score[1];
    });
    /**When the server sends a room list, the player can pick a room or
       start a new one
       */
    socket.on('roomList', function(data){
	//First check if there are any rooms and prompt to make a new one
	//if there are none.
	if(data.numRooms == 0){
	    displaySelection("newRoom");
//    var roomName = prompt("You must create a game room to play "+
//			  "in. What should the name be?");
//    createRoom(roomName);
	    return;
	}
	//Check if the player wants to use an existing room 
	//Construct the room list
	//XXXX this doesn't work yet
	var roomList = "";
	for(i=0; i<data.numRooms; i=i+1){
		roomList=roomList+"<a class='button' href='#' onclick='joinRoom("+data.rooms[i]+", 'player');'></a>";
	}
	//Prompt for a valid room number
	displaySelection("newRoom?", roomList);
//	while(data.rooms.indexOf(room)==-1){
	    
//	  room = prompt("In which room would you like to play? \n"+
//			roomList);
//	}
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
    //alert the server of our player status
};

/**
 * Select the room to join.
 *@param room a string representing the room name
 *@param clientType player or spectator as a string
 */
function joinRoom(room, clientType){
    socket.emit('joinRoom', {name: room, clientType: clientType});
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
 * Asks the user for some login information and stores it for submission 
 * to the server.
 */
function performAuthentication(){
    var username = localStorage.getItem("username");
    var pin = localStorage.getItem("pin");
};


function displaySelection(selection, options){
    var view = document.getElementById("view");
    if(selection == "gameCanvas"){
	view.innerHTML = "<canvas id='gameCanvas' height='100' "+
	    "width='100'></canvas><br /><a href='#' "+
	    "onClick='changePaddlePosition('W');'>Up</a>"+      
	    "<a href='#' onClick='changePaddlePosition('S');'>Down</a>";
	initCanvas();
    }else if(selection == "inputMethodSelection"){
	view.innerHTML = " <div id=\"mainWrapper\"><h1 align='center'>Select your input method.</h1>"+
	    "<a align='center' class=\"button\" onclick=\"handleInputSelect('keys');\" href=\"#\">Keyboard</a>"+
	    "<a align='center' class=\"button\" onclick=\"handleInputSelect('touchscreen');\" href=\"#\">Touchscreen Buttons</a>"+
	    "<a align='center' class=\"button\" onclick=\"handleInputSelect('localAccel');\" href=\"#\">Local Accelerometer</a>"+
	    "<a align='center' class=\"button\" onclick=\"handleInputSelect('wii');\" href=\"#\">Wii Remote</a></div>";
    }else if(selection == "selectRoom"){
	view.innerHTML = " <div id=\"mainWrapper\"><h1 align='center'>Room options:"+
	    "</h1>"+options+"<br /></div>";
    }else if(selection == "newRoom?"){
	view.innerHTML = " <div id=\"mainWrapper\"><h1 align='center'>Do you want to create a new room?</h1>"+
	    "<a align='center' class=\"button\" onclick=\"displaySelection('newRoom', 'bleh');\" href=\"#\">New Room</a>"+
	    "<a align='center' class=\"button\" onclick=\"displaySelection('selectRoom',"+options+");\" href=\"#\">Select an existing room</a>";
    }else if(selection == "newRoom"){
	view.innerHTML = " <div id=\"mainWrapper\"><h1 align='center'>What do you want to name "+
	    "your game room?</h1><form name='roomName' "+
	    "id='pinEntry'><!-- Room --><input type='text' "+
	    "value='' name='userName' id='roomName' "+
	    "onFocus='this.value=''' autocapitalize='off' "+
	    "autocorrect='off' /><!-- Submit --><input type='button' "+
	    "value='Select Room' id='selectRoom' "+
	    "onClick='handleNewRoom();' /></form><br /></div>";
	    "should the name be?";
    }else if(selection == "gameEnd"){
	view.innerHTML == "The game is over.  You "+options+".";
    }
};

function handleRoomSelect(){
    var room = document.roomSelection.roomSelection.value;
    joinRoom(room, "player");
};

function handleNewRoom(){
    var room = document.roomName.roomName.value;
    createRoom(room);
};
