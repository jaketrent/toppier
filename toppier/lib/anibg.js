var BAR_WIDTH = 50;
var BAR_SPEED = 0.5;
var MAX_ANGLE = Math.PI / 32;
var COLOR_STEP = 0.01;

function AniBg(canvasId, bgImg) {
	var canvas = document.getElementById(canvasId);
	
	var bgImgReady = false;
	var backgroundImage = new Image();
	backgroundImage.onload = imageLoaded;
	backgroundImage.src = bgImg;
	
	var colors = new Array();
	colors.push(new Color(200, 160, 150));
	colors.push(new Color(230, 160, 90));
	colors.push(new Color(230, 240, 90));
	colors.push(new Color(100, 240, 190));
	colors.push(new Color(100, 170, 220));
	colors.push(new Color(200, 100, 220));
	
	var nextColorIndex = 0;
	var activeColor = colors[nextColorIndex++];
	
	var leftOffset = 0 - BAR_WIDTH;

	var angle = MAX_ANGLE;
	var angleAdjust = Math.PI / 3600;
	
	this.start = function() {
		backgroundImageReady();
	}
	
	function imageLoaded() {
		bgImgReady = true;
	}
	
	function backgroundImageReady() {
	    if (!bgImgReady) {
	        setTimeout(backgroundImageReady,100);

	    } else {
	    	beginAnimateBackground();
		}
	}

	function beginAnimateBackground() {
		var context = canvas.getContext('2d');
		context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

		if (activeColor.fadeTo(colors[nextColorIndex])) {
			activeColor = colors[nextColorIndex++];
			if (nextColorIndex >= colors.length) {
				nextColorIndex = 0;
			}
		}

		context.globalAlpha = 0.6;
		context.fillStyle = 'rgb(' + activeColor.getRGB() + ')';
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.save();
		context.globalAlpha = 0.25;
		
		context.translate(canvas.width / 2, canvas.height / 2);
		context.rotate(angle += angleAdjust);
		
		for (var i = leftOffset; i < canvas.width + 600; i += (BAR_WIDTH * 2)) {
			context.fillRect(i - (canvas.width / 2), 0 - (canvas.height / 2) - 200, BAR_WIDTH, canvas.height + 400);
		}

		if (angle > MAX_ANGLE || angle < 0 - MAX_ANGLE) {
			angleAdjust = 0 - angleAdjust;
		}
		
		leftOffset -= BAR_SPEED;
		if (leftOffset + BAR_WIDTH * 2 + 300 < 0) {
			leftOffset += BAR_WIDTH * 2;
		}

		context.restore();
		setTimeout(beginAnimateBackground,0);
	}
}

function Color(r,g,b) {
	this.r = r;
	this.g = g;
	this.b = b;
	
	this.step = COLOR_STEP;
	
	this.fadeTo = function(color) {
		this.r = this.r + ((color.r - this.r) * this.step);
		this.g = this.g + ((color.g - this.g) * this.step);
		this.b = this.b + ((color.b - this.b) * this.step);
		
		this.step += COLOR_STEP;
		
		if (this.r == color.r &&
				this.g == color.g &&
				this.b == color.b) {
					
			this.step = COLOR_STEP;
			return true;
		}
		return false;
	}
	
	this.getRGB = function() {
		return Math.round(this.r) + "," +
				Math.round(this.g) + "," +
				Math.round(this.b);
	}
}