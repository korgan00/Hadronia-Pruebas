var X = 0, Y = 1;
var SIN45 = Math.sin(45*Math.PI/180);
var COS45 = Math.cos(45*Math.PI/180);
var SIN315 = Math.sin(-45*Math.PI/180);
var COS315 = Math.cos(-45*Math.PI/180);

function Engine(canvas){
	this.canvas = canvas;
	this.TIME_INTERVAL = 10;//ms
	
	this.model = new Model();
	this.renderer = new Renderer(this.canvas, this.model);
	this.eventMan = new EventManager();
}
Engine.prototype.start = function (){
	this._configureEvents();
	setInterval(this.step.bind(this), this.TIME_INTERVAL);
};
Engine.prototype.step = function (){	
	this.eventMan.step();
	this.model.step();
	this.renderer.step();
};
Engine.prototype._configureEvents = function (){
	this.eventMan.setMouseEventsToCanvas(this.canvas);
	this.eventMan.mouse.startDrag = this.model.startDrawing.bind(this.model);
	this.eventMan.mouse.stopDrag = this.model.stopDrawing.bind(this.model);
	this.eventMan.mouse.move = this.model.mouseMove.bind(this.model);
};

/**************************************************/
/******************** EVENTS **********************/
/**************************************************/
function EventManager () {
	this.CANVAS_BORDER = 2;
	this.contextMenu = function (){
				console.log("Info: Menu contextual deshabilitado");
				return false; 
			};
	this.mouse = new MouseInfo();
	this.onLoadImg = function (){ 
				console.log("Info: Carga de imagen no manejada."); 
			};
}
EventManager.prototype.setMouseEventsToCanvas = function (canvas){
	canvas.onmousedown = this.mouse.mousePress.bind(this.mouse);
	canvas.onmouseup = this.mouse.mouseRelease.bind(this.mouse);
	canvas.onmousemove = this.mouse.mouseMove.bind(this.mouse);
	canvas.oncontextmenu = this.contextMenu;
};
EventManager.prototype.step = function () {};

function MouseInfo(){
	var defaultEv = function (e){ console.log("Unhandled event"); };
	
	this.lastMouseX = 0;
	this.lastMouseY = 0;
	this.actualMouseX = 0;
	this.actualMouseY = 0;
	
	//Functions to trigger
	this.startDrag = defaultEv;
	this.stopDrag = defaultEv;
	this.move = defaultEv;
}

MouseInfo.prototype.update = function (){
	this.lastMouseX = this.actualMouseX;
	this.lastMouseY = this.actualMouseY;
};
MouseInfo.prototype.mouseMove = function (e){
	var evt = window.event || e ,//cross browser event object
		cnvs = evt.target,
		rect = cnvs.getBoundingClientRect();
	this.actualMouseX = evt.clientX - rect.left;
	this.actualMouseY = evt.clientY - rect.top;
	point = this._transformPoint(this.actualMouseX, this.actualMouseY);
	this.move(point[X], point[Y]);
	this.update();
};
MouseInfo.prototype.mousePress = function (e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("startDrawing" + evt.button 
				+ " | x: " + this.actualMouseX 
				+ " | y: " + this.actualMouseY);
		point = this._transformPoint(this.actualMouseX, this.actualMouseY);
		this.startDrag(point[X], point[Y]);
	};
};
MouseInfo.prototype.mouseRelease = function (e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("stopDrawing" + evt.button 
				+ " | x: " + this.actualMouseX 
				+ " | y: " + this.actualMouseY);
		this.stopDrag();
	};
};
MouseInfo.prototype._transformPoint = function(x,y){
	y *= 2;
	return [(x*COS45) - (y*SIN45) , ((x*SIN45) + (y*COS45))];
};



/**************************************************/
/******************** RENDERER ********************/
/**************************************************/
function Renderer(canvas, model){
	this.TIME_INTERVAL = 10;//ms
	this.canvas = canvas;
	this.ctx = document.getElementById('c').getContext('2d');
	this.model = model;
}
Renderer.prototype.clear = function(){
	this.canvas.width = this.canvas.width;
};

Renderer.prototype.step = function () {
	this.clear();
	
	for (var i = 0; i<this.model.ortoList.length; i++){
	//	this.drawOrto(this.model.ortoList[i]);
	}

	if(this.model.orto !== null)
		this.drawBase(this.model.orto);
//	images = this.model.images;

//	this.drawGrid();
	
/*	for (var i = 0; i < images.length; i++) {
		var img = images[i];
		if(this.model.isLastDraggedShape(images[i])){
			this.ctx.beginPath();
			this.ctx.rect(img.pos[X], img.pos[Y], img.image.width, img.image.height);
			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = '#00FF00';
			this.ctx.stroke();
			this.ctx.closePath();
		}
		this.ctx.drawImage(img.image, img.pos[X], img.pos[Y], 
				img.image.width, img.image.height);
	}*/
};

Renderer.prototype.drawAxis = function(x,y){
	this.ctx.save();
	this.ctx.translate(x,y);
	
	this.ctx.beginPath();
	this.ctx.strokeStyle = 'green';
	this.ctx.moveTo(0, -(this.canvas.height));
	this.ctx.lineTo(0, this.canvas.height);
	this.ctx.stroke();
	
	this.ctx.scale(1, 0.5);
	this.ctx.rotate(-45*Math.PI/180);
	this.ctx.lineWidth = 2;
	
	this.ctx.beginPath();
	this.ctx.strokeStyle = 'blue';
	this.ctx.moveTo(0, -(this.canvas.height));
	this.ctx.lineTo(0, this.canvas.height);
	this.ctx.stroke();

	this.ctx.beginPath();
	this.ctx.strokeStyle = 'red';
	this.ctx.moveTo(-(this.canvas.width), 0);
	this.ctx.lineTo(this.canvas.width, 0);
	this.ctx.stroke();
	
	this.ctx.closePath();
	this.ctx.restore();
};

Renderer.prototype.drawBase = function(orto){
	this.ctx.save();
//	var x = orto.xEnd * COS45 - orto.yEnd * SIN45;
//	var y = orto.xEnd * SIN45 + orto.yEnd * COS45;
	this.ctx.scale(1, 0.5);
	this.ctx.rotate(-45*Math.PI/180);
	this.ctx.translate(orto.xOrigin, orto.yOrigin);

	this.lineWidth = 2;
	this.strokeStyle = 'black';
	this.ctx.beginPath();
	this.ctx.moveTo(0,0);
	this.ctx.lineTo(orto.xEnd, 0);
	this.ctx.lineTo(orto.xEnd, orto.yEnd);
	this.ctx.lineTo(0, orto.yEnd);
	this.ctx.lineTo(0,0);
	
	this.ctx.stroke();
	this.ctx.restore();
};

Renderer.prototype.drawOrto = function(orto){
	this.ctx.save();
	
	this.ctx.translate(orto.xOrigin, orto.yOrigin);
	
//	this.drawBase(orto);
	
	this.ctx.restore();
};


/**************************************************/
/********************* MODEL **********************/
/**************************************************/

function Model(){
	this.ortoList = [];
	this.orto = null;
	this.selectedOrto = null;
	this.drawingHeight = false;
	this.cont = 0;
};

Model.prototype.step = function (){
//	if (this.drawingHeight == false){
//		this.orto = new this.Orto(300, 0, this.cont);
//		this.orto.xEnd = 100;
//		this.orto.yEnd = 100;
//		this.cont++;
//		this.orto.id = 0;
//	}
};

Model.prototype.startDrawing = function (x, y) {
	if (this.drawingHeight === false){
		this.orto = new this.Orto(x, y, this.cont);
		this.orto.xEnd = 0;
		this.orto.yEnd = 0;
		this.cont++;
		this.orto.id = 0;
	}
	
/*	for (var i = this.images.length-1; i >= 0; i--) {
		if( this.images[i].isHovered(x, y)) {
			this.draggedShape = this.images[i];
			this.lastDraggedShapePos = i;
			break;
		}
	}*/
	
};

Model.prototype.stopDrawing = function () {
	this.ortoList.push(this.orto);
//	this.();
//	this.draggedShape = null;
};

Model.prototype.mouseMove = function (x, y) {
//	if(this.draggedShape !== null)
//		this.draggedShape.move(xIncr, yIncr);
	//point = this.transformPoint(x, y);
	if(this.orto !== null){
		this.orto.xEnd = x-this.orto.xOrigin;
		this.orto.yEnd = y-this.orto.yOrigin;
	}
};

Model.prototype.nearestPoint = function(x,y){
	var nearX = 0, nearY = 0,
		xDivs = 0, yDivs = 0,
		DIVS_SIZE = 100,//px 
		CANVAS_SIZE = 600,
		MAX_DIVS = Math.floor(CANVAS_SIZE/DIVS_SIZE) -1;
	
	xDivs = Math.round(x/DIVS_SIZE);
	yDivs = Math.round(y/DIVS_SIZE);
	
	if( xDivs < 0 ) xDivs = 0;
	else if (xDivs >= MAX_DIVS) xDivs = MAX_DIVS;

	if( yDivs < 0 ) yDivs = 0;
	else if (yDivs >= MAX_DIVS) yDivs = MAX_DIVS;
	
	nearX = xDivs * DIVS_SIZE;
	nearY = yDivs * DIVS_SIZE;
	
	return [nearX, nearY];
};

Model.prototype.Orto = function(x, y, id){
	this.id = id;
	
	this.xOrigin = x;
	this.yOrigin = y;
	
	this.xEnd = null;
	this.yEnd = null;
	
	this.height = null;
};

/*Model.prototype.transformPoint = function(x,y){
	return [(x*COS45) - (y*SIN45) , ((x*SIN45) + (y*COS45))];
};*/
/*
function ImageShape(img){
	this.pos = [0,0];
	this.image = img;
}
ImageShape.prototype.move = function (xIncrement, yIncrement){
	this.pos[X] += xIncrement;
	this.pos[Y] += yIncrement;
};
ImageShape.prototype.isHovered = function (mouseX, mouseY){
	return this.pos[X] < mouseX && 
			this.pos[X]+this.image.width > mouseX && 
			this.pos[Y] < mouseY && 
			this.pos[Y]+this.image.height > mouseY; 
};*/
