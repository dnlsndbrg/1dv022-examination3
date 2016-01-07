function removeOutline() {
	if (document.querySelector(".keyboardSelect")) {
		document.querySelector(".keyboardSelect").classList.remove("keyboardSelect");
	}	
}

function select(board) {
	removeOutline();
	var selected = board.keyboardSelect.x + board.keyboardSelect.y * board.columns;
	board.imageArray[selected].element.classList.add("keyboardSelect");
}


function handleInput(board) {

	window.onkeyup = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;

		if (key == 37) {
			//left
			if (board.keyboardSelect.x > 0) {
				board.keyboardSelect.x -= 1;
				select(board);
			}
		}else if (key == 38) {
			//up
			if (board.keyboardSelect.y > 0) {
				board.keyboardSelect.y -= 1;
				select(board);
			}
		}else if (key == 39) {
			//right
			if (board.keyboardSelect.x < board.columns - 1) {
				board.keyboardSelect.x += 1;
				select(board);
			}
		} else if(key == 40) {
			//down
			if (board.keyboardSelect.y < board.rows - 1) {
				board.keyboardSelect.y += 1;
				select(board);
			}
		} else if (key == 32) {
			//space
		var selected = board.keyboardSelect.x + board.keyboardSelect.y * board.columns;
		board.imageArray[selected].click();
		}
	};
}



module.exports.handleInput = handleInput;
module.exports.removeOutline = removeOutline;