//Se supone ordenado en orden creciente de z
var images = [];
var canvas = document.getElementById('c');
var ctx = document.getElementById('c').getContext('2d');
var TIME_INTERVAL = 10;//ms
var lastMouseX = 0;
var lastMouseY = 0;
var actualMouseX = 0;
var actualMouseY = 0;
var draggingShape = null;
var offsetX = canvas.offsetLeft + 2;
var offsetY = canvas.offsetTop + 2;

var X = 0;
var Y = 1;

function ImageShape(img, z){
	this.pos = [0,0];
	this.image = img;
	this.z = z;
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

function cargaImagen(){
	var url = document.getElementById("i").files[0];
	var img = new Image;
	img.src = URL.createObjectURL(url);
	img.onload = function() {
		var imgShape = new ImageShape(img, images.length);
	    images.push(imgShape);
	};
}
function start(){
	canvas.onmousedown = startDragging;
	canvas.onmouseup = stopDragging;
	canvas.onmousemove = drag;
	setInterval(draw, TIME_INTERVAL);
}
function drag(e){
	 var evt=window.event || e ;//cross browser event object
	 actualMouseX = evt.clientX - offsetX;
	 actualMouseY = evt.clientY - offsetY;
}
function startDragging(e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("startDragging" + evt.button);
		
		for (var i = images.length-1; i >= 0; i--) {
			if( images[i].isHovered(actualMouseX, actualMouseY)){
				draggingShape = images[i];
				break;
			}
		}
		
	}
	
}
function stopDragging(e){
	var evt = window.event || e ;//cross browser event object
	if(evt.button === 0){// 0 izquierdo, 1 central, 2 derecho
		console.log("stopDragging" + evt.button);
		draggingShape = null;
		stick();
	}
}
function draw() {
	canvas.width = canvas.width;
	
	if(draggingShape !== null) dragShape();

	lastMouseX = actualMouseX;
	lastMouseY = actualMouseY;
	for (var i = 0; i < images.length; i++) {
	    ctx.drawImage(images[i].image, images[i].pos[X], images[i].pos[Y]);
	}
}

function dragShape(){
	var difX = actualMouseX-lastMouseX,
		difY = actualMouseY-lastMouseY;
	draggingShape.move(difX, difY);
}

function stick(){
	
}