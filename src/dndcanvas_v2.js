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
Engine.prototype.loadImg = function (id){
	this.eventMan.loadImg(id);
};



/**************************************************/
/******************** EVENTS **********************/
/**************************************************/
function EventManager () {
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
	this.mouse.offsetX = canvas.offsetLeft + 2;
	this.mouse.offsetY = canvas.offsetTop + 2;
	canvas.oncontextmenu = this.contextMenu;
};
EventManager.prototype.step = function () {};

EventManager.prototype.loadImg = function (id) {
	var url = document.getElementById(id).files[0];
	var img = new Image;
	img.src = URL.createObjectURL(url);
	var lf = this.onLoadImg;
	img.onload = function() {
		var imgShape = new ImageShape(this);
		lf(imgShape);
	};
};
function MouseInfo(){
	var defaultEv = function (e){ console.log("Unhandled event"); };
	
	this.lastMouseX = 0;
	this.lastMouseY = 0;
	this.actualMouseX = 0;
	this.actualMouseY = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	
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
	var evt = window.event || e ;//cross browser event object
	this.actualMouseX = evt.clientX - this.offsetX;
	this.actualMouseY = evt.clientY - this.offsetY;
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
	
	for (var i = 0; i < images.length; i++) {
		this.ctx.drawImage(images[i].image, images[i].pos[X], images[i].pos[Y]);
	}
};




/**************************************************/
/********************* MODEL **********************/
/**************************************************/

function Model(){
	this.images = [];
	this.draggedShape = null;
	this.lastDraggedShape = null;
}
Model.prototype.step = function (){};
Model.prototype.startDragging = function (x, y) {
	//Supongo las imagenes ordenadas en z de mas profundo a menos.
	for (var i = this.images.length-1; i >= 0; i--) {
		if( this.images[i].isHovered(x, y)) {
			this.draggedShape = this.images[i];
			this.lastDraggedShape = this.draggedShape;
			break;
		}
	}
};
Model.prototype.stopDragging = function () {
	this.draggedShape = null;
};
Model.prototype.mouseMove = function (xIncr, yIncr) {
	if(this.draggedShape !== null)
		this.draggedShape.move(xIncr, yIncr);
};
Model.prototype.addImg = function (img){
	this.images.push(img);
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
