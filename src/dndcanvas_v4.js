var X = 0, Y = 1;

function Engine(canvas){
	this.canvas = canvas;
	this.TIME_INTERVAL = 10;//ms
	
	this.model = new Model();
	this.renderer = new Renderer(this.canvas, this.model);
	this.eventMan = new EventManager();
}
Engine.prototype._configureEvents = function (){
	this.eventMan.setMouseEventsToCanvas(this.canvas);
	this.eventMan.mouse.startDrag = this.model.startDragging.bind(this.model);
	this.eventMan.mouse.stopDrag = this.model.stopDragging.bind(this.model);
	this.eventMan.mouse.move = this.model.mouseMove.bind(this.model);
	this.eventMan.onLoadImg = this.model.addImg.bind(this.model);
};
Engine.prototype.start = function (){
	this._configureEvents();
	setInterval(this.step.bind(this), this.TIME_INTERVAL);
};
Engine.prototype.step = function (){	
	this.eventMan.step();
	this.model.step();
	this.renderer.step();
};
Engine.prototype.loadImg = function (id, gridAdjustCheck){
	this.eventMan.loadImg(id, gridAdjustCheck);
};
Engine.prototype.float = function (){
	this.model.float();
};
Engine.prototype.sink = function (){
	this.model.sink();
};
Engine.prototype.floatMax = function (){
	this.model.floatMax();
};
Engine.prototype.sinkMax = function (){
	this.model.sinkMax();
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
EventManager.prototype.loadImg = function (id, gridAdjustCheck) {
	var url = document.getElementById(id).files[0];
	var gridAdjust = document.getElementById(gridAdjustCheck).checked;
	var img = new Image;
	img.src = URL.createObjectURL(url);
	var lf = this.onLoadImg;
	img.onload = function() {
		var imgShape = new ImageShape(this);
		lf(imgShape, gridAdjust);
	};
};
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
MouseInfo.prototype.xIncrement = function (){
	return this.actualMouseX - this.lastMouseX;
};
MouseInfo.prototype.yIncrement = function (){
	return this.actualMouseY - this.lastMouseY;
};
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
	this.move( this.xIncrement(), this.yIncrement() );
	this.update();
};
MouseInfo.prototype.mousePress = function (e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("startDragging" + evt.button);
		this.startDrag(	this.actualMouseX, this.actualMouseY);
	}
};
MouseInfo.prototype.mouseRelease = function (e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("stopDragging" + evt.button);
		this.stopDrag();
	};
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
	
	images = this.model.images;

	this.drawGrid();
	
	for (var i = 0; i < images.length; i++) {
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
	}
};
Renderer.prototype.drawGrid = function (){
	var DIVS_SIZE = 100,//px 
		CANVAS_SIZE = 600,
		MAX_DIVS = Math.floor(CANVAS_SIZE/DIVS_SIZE);

	this.ctx.beginPath();
	this.ctx.strokeStyle = '#444444';
	for(var i = 1; i < MAX_DIVS; i++){
		this.ctx.moveTo(i*DIVS_SIZE, 0);
		this.ctx.lineTo(i*DIVS_SIZE, CANVAS_SIZE);
	}
	for(var j = 1; j < MAX_DIVS; j++){
		this.ctx.moveTo(0, j*DIVS_SIZE);
		this.ctx.lineTo(CANVAS_SIZE, j*DIVS_SIZE);
	}
	this.ctx.stroke();
	this.ctx.closePath();
};



/**************************************************/
/********************* MODEL **********************/
/**************************************************/

function Model(){
	this.images = [];
	this.draggedShape = null;
	this.lastDraggedShapePos = null;
}
Model.prototype.step = function (){};
Model.prototype.startDragging = function (x, y) {
	for (var i = this.images.length-1; i >= 0; i--) {
		if( this.images[i].isHovered(x, y)) {
			this.draggedShape = this.images[i];
			this.lastDraggedShapePos = i;
			break;
		}
	}
};
Model.prototype.stopDragging = function () {
	this.sticky();
	this.draggedShape = null;
};
Model.prototype.mouseMove = function (xIncr, yIncr) {
	if(this.draggedShape !== null)
		this.draggedShape.move(xIncr, yIncr);
};
Model.prototype.addImg = function (img, gridAdjust){
	if(gridAdjust){
		var p = this.nearestPoint(img.image.width - img.pos[X], 
				img.image.height - img.pos[Y]);
		img.image.width = p[X];
		img.image.height = p[Y];
	}
	this.images.push(img);
};
Model.prototype.isLastDraggedShape = function (img){
	return this.images[this.lastDraggedShapePos] === img;
};

Model.prototype.float = function (){
	if(this.lastDraggedShapePos !== this.images.length-1 ){
		var img = this.images[this.lastDraggedShapePos];
		this.images[this.lastDraggedShapePos] = 
				this.images[this.lastDraggedShapePos+1];
		this.images[this.lastDraggedShapePos+1] = img;
		this.lastDraggedShapePos++;
	}
};
Model.prototype.sink = function (){
	if(this.lastDraggedShapePos !== 0){
		var img = this.images[this.lastDraggedShapePos];
		this.images[this.lastDraggedShapePos] = 
				this.images[this.lastDraggedShapePos-1];
		this.images[this.lastDraggedShapePos-1] = img;
		this.lastDraggedShapePos--;
	}
};
Model.prototype.floatMax = function (){
	while(this.lastDraggedShapePos !== this.images.length-1){
		this.float();
	}
};
Model.prototype.sinkMax = function (){
	while(this.lastDraggedShapePos !== 0){
		this.sink();
	}
};
Model.prototype.sticky = function(){
	var x, y, newPos;
	if(this.draggedShape){
		x = this.draggedShape.pos[X],
		y = this.draggedShape.pos[Y],
		newPos = this.nearestPoint(x, y);
		
		this.draggedShape.pos[X] = newPos[X];
		this.draggedShape.pos[Y] = newPos[Y];
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
};
