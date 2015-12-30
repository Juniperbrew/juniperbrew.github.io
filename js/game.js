// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {
	speed: 50
};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Init the game
var init = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	createNewMonster();
};

function createNewMonster(){
	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
	monster.direction = newDirection();
}

// Update game objects
var update = function (modifier) {
	var dx = 0;
	var dy = 0;
	if (38 in keysDown) { // Player holding up
		dy = -hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		dy = hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		dx = -hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		dx = hero.speed * modifier;
	}
	if(!outOfBounds(hero.x+dx,hero.y,32,32)){
		hero.x += dx;
	}
	if(!outOfBounds(hero.x,hero.y+dy,32,32)){
		hero.y += dy;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		createNewMonster();
	}

	var movement = moveEntity(monster,modifier);
	if(outOfBounds(monster.x+movement.dx,monster.y+movement.dy,32,32)){
		monster.direction = newDirection();
	}else{
		monster.x += movement.dx;
		monster.y += movement.dy;
	}
};

function moveEntity(entity,modifier){
	var dx = 0;
	var dy = 0;
	if(entity.direction == 0){
		dy = -monster.speed * modifier;
	}
	if(entity.direction == 1){
		dx = monster.speed * modifier;
	}
	if(entity.direction == 2){
		dy = monster.speed * modifier;
	}
	if(entity.direction == 3){
		dx = -monster.speed * modifier;
	}
	return {dx,dy};
}

function outOfBounds(x, y, width, height){
	if(x<0||y<0||x+width>canvas.width||y+height>canvas.height){
		return true;
	}else{
		return false;
	}
}

function newDirection(){
	return Math.floor(Math.random() * 4);
}

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
init();
main();