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
function Hero (){
	this.x = canvas.width / 2;
	this.y = canvas.height / 2;
	this.speed = 256;
};

function Monster(){
	this.speed = 50;
	this.width = 32;
	this.x = mapBorderWidth + (Math.random() * (canvas.width - 2*mapBorderWidth-this.width));
	this.y = mapBorderWidth + (Math.random() * (canvas.height - 2*mapBorderWidth-this.width));
	this.newDirection();
}
Monster.prototype.newDirection = function() {
		this.direction = Math.floor(Math.random() * 4);
		this.nextDirectionChange = Date.now() + (1+(Math.random() * 3))*1000;
};
Monster.prototype.move = function (delta) {
		var dx = 0;
		var dy = 0;
		if(this.direction == 0){
			dy = -this.speed * delta;
		}
		if(this.direction == 1){
			dx = this.speed * delta;
		}
		if(this.direction == 2){
			dy = this.speed * delta;
		}
		if(this.direction == 3){
			dx = -this.speed * delta;
		}
		return {dx,dy};
};
Monster.prototype.act = function(delta) {
		if(Date.now()>this.nextDirectionChange){
			this.newDirection();
		}
		var movement = this.move(delta);
		if(outOfBounds(this.x+movement.dx,this.y+movement.dy,32,32)){
			this.newDirection();
		}else{
			this.x += movement.dx;
			this.y += movement.dy;
		}
};

var hero = new Hero();
var monsters = [];
var nextMonsterSpawn;
var monstersCaught = 0;
var fps = 0;
var mapBorderWidth = 32;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function spawnMonster(){
	monsters.push(new Monster());
	var delay = (0.1+Math.random()*2);
	console.log("Next monster spawn in "+delay+" seconds.");
	nextMonsterSpawn = Date.now() + delay*1000;
}

function outOfBounds(x, y, width, height){
	if(x<mapBorderWidth||y<mapBorderWidth||x+width>canvas.width-mapBorderWidth||y+height>canvas.height-mapBorderWidth){
		return true;
	}else{
		return false;
	}
}

// Update game objects
var update = function (delta) {

	if(Date.now()>nextMonsterSpawn){
		spawnMonster();
	}
	var dx = 0;
	var dy = 0;
	if (38 in keysDown) { // Up
		dy = -hero.speed * delta;
	}
	if (40 in keysDown) { // Down
		dy = hero.speed * delta;
	}
	if (37 in keysDown) { // Left
		dx = -hero.speed * delta;
	}
	if (39 in keysDown) { // Right
		dx = hero.speed * delta;
	}
	if(!outOfBounds(hero.x+dx,hero.y,32,32)){
		hero.x += dx;
	}
	if(!outOfBounds(hero.x,hero.y+dy,32,32)){
		hero.y += dy;
	}
	for(var i = 0; i < monsters.length;i++){
		var monster = monsters[i];
		if (hero.x <= (monster.x + 32)
			&& monster.x <= (hero.x + 32)
			&& hero.y <= (monster.y + 32)
			&& monster.y <= (hero.y + 32)) {
				++monstersCaught;
				monsters.splice(i,1);
				continue;
		}
		monster.act(delta);
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		for(i = 0;i<monsters.length;i++){
			var monster = monsters[i];
			ctx.drawImage(monsterImage, monster.x, monster.y);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);

	ctx.fillText("FPS: " + fps, 32, 64);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	fpsCounter++;
	if(fpsCounter>=60){
		fps = Math.round(fpsCounter/((Date.now()-fpsPolled)/1000));
		fpsPolled = Date.now();
		fpsCounter = 0;
	}

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
var fpsPolled = Date.now();
var fpsCounter = 0;
spawnMonster();
main();