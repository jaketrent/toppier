/**
 * @author radikalfx
 * @url http://radikalfx.com/files/collage/jcollage.js
 */
function Collage(canvasId) {
	var NONE = 0, MOVING = 1, SCALING = 2, ROTATING = 3;
	
	var mouseDown = false;
	var mousePrevX = 0;
	var mousePrevY = 0;
	
	var selectedLayer = null;
	var layerState = NONE;
	
	var backgroundColor = null;
	var backgroundImage = null;
	
	var canvasOffsetX = 0;
	var canvasOffsetY = 0;
	
	var scaleImg = new Image();
	var rotateImg = new Image();
	scaleImg.src = "media/img/resize.png";
	rotateImg.src = "media/img/rotate.png";
	
	var canvas = $(canvasId)[0];
	
	canvasOffsetX = $(canvasId).offset().left;
	canvasOffsetY = $(canvasId).offset().top;
	
	var context = canvas.getContext('2d');
	var layers = new Array();
	
	canvas.addEventListener('mousemove', mouseMoveEvent, false);
	canvas.addEventListener('mouseout', mouseOutEvent, false);
	canvas.addEventListener('mouseup', mouseOutEvent, false);
	canvas.addEventListener('mouseleave', mouseOutEvent, false);
	canvas.addEventListener('mousedown', mouseDownEvent, false);
	
	this.addLayer = function(img) {
		var layer = new Layer(img);
		layers.push(layer);
		
		redrawCanvas();
		return layer;
	}
	this.redraw = function() {
		redrawCanvas();
	}
	this.getCanvas = function() {
		return canvas;
	}
	this.setBackgroundImage = function(img) {
		backgroundImage = img;
		redrawCanvas();
	}
	this.setBackgroundColor = function(color) {
		backgroundColor = color;
		redrawCanvas();
	}
	
	this.getLayers = function() {
		return layers;
	}
	this.getLayer = function(i) {
		return layers[i];
	}
	this.moveLayerUp = function(i) {
		i = parseInt(i);
		if (i < layers.length - 1) {
			var swapLayer = layers[1 + i];
			layers[1 + i] = layers[i];
			layers[i] = swapLayer;
			redrawCanvas();
			return true;
		} else {
			return false;
		}
	}
	this.moveLayerDown = function(i) {
		i = parseInt(i);
		if (i > 0) {
			var swapLayer = layers[i - 1];
			layers[i - 1] = layers[i];
			layers[i] = swapLayer;
			redrawCanvas();
			return true;
		} else {
			return false;
		}
	}
	this.removeLayer = function(i) {
		i = parseInt(i);
		if (i >= 0 && i < layers.length) {
			layers.splice(i,1);
			redrawCanvas();
		}
	}
	this.clearLayers = function () {
    layers = [];
    redrawCanvas();
  }

	function redrawCanvas() {
		if (backgroundImage != null) {
			context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
		} else if (backgroundColor != null && backgroundColor != "") {
			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			context.clearRect(0, 0, canvas.width, canvas.height);
		}
		for (i in layers) {
			if (layers[i].isVisible()) {
				context.save();
				
				context.globalAlpha = layers[i].getOpacity();
				context.globalCompositeOperation = layers[i].getCompositeOperation();
				
				if (layers[i].hasShadow()) {
					context.shadowColor = "#000";
					context.shadowOffsetX = 3;
					context.shadowOffsetY = 3;
					context.shadowBlur = 15;
				}
				
				context.translate(layers[i].offsetX + (layers[i].width / 2), layers[i].offsetY + (layers[i].height / 2));
				context.rotate(layers[i].getAngle());
				
				context.drawImage(layers[i].getCanvas(), 0 - (layers[i].width / 2), 0 - (layers[i].height / 2));
				
				context.restore();
			}
		}
	}
	
	function drawMarker(layer) {
		redrawCanvas();
		
		context.save();
		context.lineWidth=1;
		context.strokeStyle = "#fff";
		context.globalAlpha = 0.75;
		
		context.translate(layer.offsetX + (layer.width / 2), layer.offsetY + (layer.height / 2));
		context.rotate(layer.getAngle());
		
		context.strokeRect(0 - (layer.width / 2), 0 - (layer.height / 2), 
			layer.width, layer.height);
		
		context.drawImage(scaleImg, 
				(layer.width / 2) - scaleImg.width,
				(layer.height / 2) - scaleImg.height);
				
		context.drawImage(rotateImg, 
				(layer.width / 2) - rotateImg.width,
				0 - (layer.height / 2));
				
		context.restore();
	}
	
	function mouseOutEvent(e) {
		mouseDown = false;
		layerState = NONE;
	}
	
	function mouseDownEvent(e) {
		mouseDown = true;
	}
	
	function mouseMoveEvent(e) {
		if (layerState == SCALING && mouseDown) {
			var square = selectedLayer.getSquare();
			var scaleToWidth = Math.sqrt(Math.pow(square.d.x - (e.pageX - canvasOffsetX), 2) + Math.pow(square.d.y - (e.pageY - canvasOffsetY), 2));
			var scaleToHeight = Math.sqrt(Math.pow(square.b.x - (e.pageX - canvasOffsetX), 2) + Math.pow(square.b.y - (e.pageY - canvasOffsetY), 2));
			
			selectedLayer.scale(scaleToWidth, scaleToHeight);
			drawMarker(selectedLayer);
			
		} else if (layerState == ROTATING && mouseDown) {
			var originX = selectedLayer.offsetX + (selectedLayer.width / 2);
			var originY = selectedLayer.offsetY + (selectedLayer.height / 2);
			var mouseX = e.pageX - canvasOffsetX;
			var mouseY = e.pageY - canvasOffsetY;
				
			var angle = Math.atan2((mouseY - originY), (mouseX - originX));
			angle = angle + (Math.PI / 4);
				
			selectedLayer.setAngle(angle);

			drawMarker(selectedLayer);
			
		} else if (layerState == MOVING && mouseDown) {
			selectedLayer.offsetX += e.pageX - canvasOffsetX - mousePrevX;
			selectedLayer.offsetY += e.pageY - canvasOffsetY - mousePrevY;
			
			drawMarker(selectedLayer);
			
		} else if (layers.length > 0) {
			var intersected = false;
			for (var i = layers.length; i--; i >= 0) {
				if (layers[i].intersect(e.pageX - canvasOffsetX, e.pageY - canvasOffsetY) && layers[i].isVisible()) {
					intersected = true;
					selectedLayer = layers[i];
				
					if (isScalingArea(e.pageX - canvasOffsetX, e.pageY - canvasOffsetY, layers[i])) {
						layerState = SCALING;
						
					} else if (isRotatingArea(e.pageX - canvasOffsetX, e.pageY - canvasOffsetY, layers[i])) {
						layerState = ROTATING;
						
					} else {
						layerState = MOVING;
					}
				
					drawMarker(layers[i]);
						
					break;
				}
			}
			if (!intersected) {
				redrawCanvas();
			}
		}
		mousePrevX = e.pageX - canvasOffsetX;
		mousePrevY = e.pageY - canvasOffsetY;
	}
	
	function isScalingArea(mX, mY, layer) {
		var scaleOffsetX = layer.offsetX + layer.width;
		var scaleOffsetY = layer.offsetY + layer.height;
		
		var square = new Square(
				new Vector(scaleOffsetX - scaleImg.width, scaleOffsetY - scaleImg.height),
				new Vector(scaleOffsetX, scaleOffsetY - scaleImg.height),
				new Vector(scaleOffsetX, scaleOffsetY),
				new Vector(scaleOffsetX - scaleImg.width, scaleOffsetY));

		square.rotate(layer.angle);
		square.alignBottomRight(layer.getSquare().c);
			
		return square.intersect(new Vector(mX, mY));
	}
	
	function isRotatingArea(mX, mY, layer) {
		var scaleOffsetX = layer.offsetX + layer.width;
		var scaleOffsetY = layer.offsetY + layer.height;
		
		var square = new Square(
				new Vector(scaleOffsetX - rotateImg.width, layer.offsetY),
				new Vector(scaleOffsetX, layer.offsetY),
				new Vector(scaleOffsetX, layer.offsetY + rotateImg.height),
				new Vector(scaleOffsetX - rotateImg.width, layer.offsetY + rotateImg.height));

		square.rotate(layer.angle);
		square.alignTopRight(layer.getSquare().b);
			
		return square.intersect(new Vector(mX, mY));
	}
}

function Layer(img) {
	this.img = img;	
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = img.naturalHeight;
	this.height = img.naturalHeight;
	
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.context = this.canvas.getContext('2d');
	this.context.save();
	this.context.translate(this.width / 2, this.height / 2);
	
	this.opacity = 1;
	this.visible = true;
	this.shadow = true;
	this.compositeOperation = "source-over";
	
	this.angle = 0;
	
	this.title = "";
	
	this.isVisible = function() {
		return this.visible;
	}
	this.toggleVisible = function() {
		this.visible = !this.visible;
	}
	
	this.hasShadow = function() {
		return this.shadow;
	}
	this.toggleShadow = function() {
		this.shadow = !this.shadow;
	}
	this.setShadow = function(shadow) {
		this.shadow = shadow;
	}
	
	this.getOpacity = function() {
		return this.opacity;
	}
	this.setOpacity = function(opacity) {
		this.opacity = opacity;
	}
	this.getImage = function() {
		return this.img;
	}
	
	this.setCompositeOperation = function(compositeOperation) {
		this.compositeOperation = compositeOperation;
	}
	this.getCompositeOperation = function() {
		return this.compositeOperation;
	}
	
	this.redraw = function() {
		var startX = this.width / 2 - this.width;
		var startY = this.height / 2 - this.height;
		
		this.context.clearRect(startX, startY, this.canvas.width, this.canvas.height);
		this.context.drawImage(this.img, startX, startY, this.width, this.height);
	}
	
	this.getCanvas = function() {
		this.redraw();
		return this.canvas;
	}
	
	this.intersect = function(x, y) {

		var square = new Square(
				new Vector(this.offsetX, this.offsetY),
				new Vector(this.offsetX + this.width, this.offsetY),
				new Vector(this.offsetX + this.width, this.offsetY + this.height),
				new Vector(this.offsetX, this.offsetY + this.height));
		
		square.rotate(this.angle);
		
		return square.intersect(new Vector(x, y));
	}
	
	this.getSquare = function() {
		var square = new Square(
				new Vector(this.offsetX, this.offsetY),
				new Vector(this.offsetX + this.width, this.offsetY),
				new Vector(this.offsetX + this.width, this.offsetY + this.height),
				new Vector(this.offsetX, this.offsetY + this.height));
				
		square.rotate(this.angle);
		
		return square;
	}
	
	this.scale = function(width, height) {
		this.context.restore();
		
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		
		this.context.translate(this.width / 2, this.height / 2);
		
		this.redraw();
	}
	
	this.setAngle = function(angle) {
		this.angle = angle;
	}
	this.getAngle = function() {
		return this.angle;
	}
	
	this.setTitle = function(title) {
		this.title = title;
	}
	this.getTitle = function() {
		return this.title;
	}

}

function Square(a, b, c, d) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.origin = centerSquareOrigin(a,b,c,d);
	
	this.intersect = function(mouse) {
		return (!intersectWithLine(this.origin, mouse, this.a, this.b) &&
			!intersectWithLine(this.origin, mouse, this.b, this.c) &&
			!intersectWithLine(this.origin, mouse, this.c, this.d) &&
			!intersectWithLine(this.origin, mouse, this.d, this.a));
	}
	
	this.rotate = function(angle) {
		var radius = Math.sqrt(Math.pow(this.origin.x - this.a.x, 2) + Math.pow(this.origin.y - this.a.y, 2));
		
		var aAngle = Math.atan2((this.a.y - this.origin.y), (this.a.x - this.origin.x));
		var bAngle = Math.atan2((this.b.y - this.origin.y), (this.b.x - this.origin.x));
		var cAngle = Math.atan2((this.c.y - this.origin.y), (this.c.x - this.origin.x));
		var dAngle = Math.atan2((this.d.y - this.origin.y), (this.d.x - this.origin.x));
		
		this.a.x = this.origin.x + radius * Math.cos(angle + aAngle);
		this.a.y = this.origin.y + radius * Math.sin(angle + aAngle);
		this.b.x = this.origin.x + radius * Math.cos(angle + bAngle);
		this.b.y = this.origin.y + radius * Math.sin(angle + bAngle);
		this.c.x = this.origin.x + radius * Math.cos(angle + cAngle);
		this.c.y = this.origin.y + radius * Math.sin(angle + cAngle);
		this.d.x = this.origin.x + radius * Math.cos(angle + dAngle);
		this.d.y = this.origin.y + radius * Math.sin(angle + dAngle);
	}
	
	this.alignBottomRight = function(alignPoint) {
		var diff = new Vector(alignPoint.x - this.c.x, alignPoint.y - this.c.y);
		
		this.a = this.a.add(diff);
		this.b = this.b.add(diff);
		this.c = this.c.add(diff);
		this.d = this.d.add(diff);
		this.origin = centerSquareOrigin(this.a, this.b, this.c, this.d);
	}
	
	this.alignTopRight = function(alignPoint) {
		var diff = new Vector(alignPoint.x - this.b.x, alignPoint.y - this.b.y);
		
		this.a = this.a.add(diff);
		this.b = this.b.add(diff);
		this.c = this.c.add(diff);
		this.d = this.d.add(diff);
		this.origin = centerSquareOrigin(this.a, this.b, this.c, this.d);
	}
	
	var epsilon = 10e-6;
	
	function centerSquareOrigin(a, b, c, d) {
		p = a;
		r = c.subtract(a);
		q = b;
		s = d.subtract(b);
		
		rCrossS = cross(r, s);
		if(rCrossS <= epsilon && rCrossS >= -1 * epsilon){
			return;
		}
		t = cross(q.subtract(p), s)/rCrossS;
		u = cross(q.subtract(p), r)/rCrossS;
		if (0 <= u && u <= 1 && 0 <= t && t <= 1){
			intPoint = p.add(r.scalarMult(t));
			return new Vector(intPoint.x, intPoint.y);
		}
		
		return null;
	}
	
	function cross(v1, v2) {
		return v1.x * v2.y - v2.x * v1.y;
	}
	
	function intersectWithLine(l1p1, l1p2, l2p1, l2p2) {
		p = l1p1;
		r = l1p2.subtract(l1p1);
		q = l2p1;
		s = l2p2.subtract(l2p1);
		
		rCrossS = cross(r, s);
		if(rCrossS <= epsilon && rCrossS >= -1 * epsilon){
			return false;
		}
		
		t = cross(q.subtract(p), s)/rCrossS;
		u = cross(q.subtract(p), r)/rCrossS;
		if(0 <= u && u <= 1 && 0 <= t && t <= 1){
			return true;
		} else{
			return false;
		}
	}
}

/**
 * http://bloggingmath.wordpress.com/2009/05/29/line-segment-intersection/
 */
function Vector(x, y) {
	this.x = x;
	this.y = y;

	this.scalarMult = function(scalar){
		return new Vector(this.x * scalar, this.y * scalar);
	}
	this.dot = function(v2) {
		return this.x * v2.x + this.y * v2.y;
	};
	this.perp = function() {
		return new Vector(-1 * this.y, this.x);
	};
	this.subtract = function(v2) {
		return this.add(v2.scalarMult(-1));//new Vector(this.x - v2.x, this.y - v2.y);
	};
	this.add = function(v2) {
		return new Vector(this.x + v2.x, this.y + v2.y);
	}
}
