var keyboard = require("./keyboard");

function Image(imageNumber, board) {
	this.element = document.createElement("div");
	this.element.classList.add("image");
	this.imageNumber = imageNumber;
	this.board = board;
	this.clickable = true;
}

Image.prototype.click = function() {
	var _this = this;

	if (this.clickable) {
		this.clickable = false;
		this.show();

		if (!this.board.selected) {
			this.board.selected = this;

		} else {
			var _selected = this.board.selected;
			this.board.attempts++;
			document.querySelector("#attempts").textContent = this.board.attempts;

			if(this.board.selected.imageNumber === this.imageNumber) {
				// match
				keyboard.removeOutline();
				this.element.classList.add("green");
				_selected.element.classList.add("green");
				this.board.selected = false;
				setTimeout(function() {
					_selected.remove();
					_this.remove();
				}, 400);
				
			} else {
				// not a match
				this.element.classList.add("red");
				_selected.element.classList.add("red");
				this.board.selected = false;

				setTimeout(function() {
					_this.element.classList.remove("red");
					_selected.element.classList.remove("red");
					_selected.hide();
					_selected.clickable = true;
					_this.hide();
					_this.clickable = true;
				}, 1000);
			}
		}
	}
};

Image.prototype.hide = function() {
	this.element.style.backgroundImage = "url('image/apps/memory/0.png')";
};

Image.prototype.show = function() {
	this.element.style.backgroundImage = "url('image/apps/memory/" + this.imageNumber + ".png')";
};

Image.prototype.remove = function() {
	this.element.classList.add("fade-out");
};

module.exports = Image;