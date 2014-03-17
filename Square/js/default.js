var globalThreshold = 1; // Initial threshold for all nodes
var squares = [];	// Holds the list of all squares

// global init function
function initSquareGrid()
{
	var xmlns = "http://www.w3.org/2000/svg";
	var square_g = document.getElementById('sqs');
	var size = 70;
	// Add rectangles
	for (var j = 0; j < numColumns; ++j)
		for (var i = 0; i < numRows; ++i)
		{
			var id = getId(i, j);
			var rect = document.createElementNS (xmlns, "rect");

			// svg properties
			rect.setAttributeNS (null, "id", getId(i, j));
			rect.setAttributeNS (null, "width", size);
			rect.setAttributeNS (null, "height", size);
			rect.setAttributeNS (null, "x", j * size);
			rect.setAttributeNS (null, "y", i * size);

			// CSS properties
			rect.style.fill = '#FFFFFF';
			rect.style['stroke-width']= '1px';
			rect.style.stroke = '#000000';

			// Infection related parameters
			rect.infected = false;
			rect.onclick = (function(){
				var id = rect.id;
				return function() { square_click(id) };
			})();

			//Add to html and js list
			square_g.appendChild(rect);
			squares.push(rect);
		}

	// Init global variable hexagons
	hexagons = document.getElementsByTagName('rect');
}

// 'onclick' event handler for each node
// Functionality: invert infection status.
function square_click(id)
{
	var square = document.getElementById(id);
	if (square.infected)
	{
		square.infected = false;
		square.style.fill = '#ffffff';
	}
	else
	{
		square.infected = true;
		square.style.fill = '#ff0000';
	}
}

// 'onchange' event handler for threshold select
// Functionality: update global threshold.
function thresholdSelect_changed()
{
	var threshold = parseInt(document.getElementById('thresholdSelect').value);
	if (threshold != NaN)
		globalThreshold = threshold;
}

// 'onclick' event hanlder for 'Run' button
// Functionality: Start the spread of epidemics.
function runButton_click()
{
	;
}

// 'onclick' event hanlder for 'Random' button
// Functionality: randomly infect some squares
function randomButton_click() {
	var inputNumber = prompt(
		"Please enter a probability to randomly infect all hexagons.", "0.5");
	var probability = Number(inputNumber);

	if (isNaN(probability) || probability < 0 || probability > 1)
	{
		alert("Illegal probability!");
	}
	for (var i = 0; i < squares.length; ++i)
		if (Math.random() < probability)
		{
			squares[i].infected = true;
			squares[i].style.fill = '#ff0000';
		}
		else
		{
			squares[i].infected = false;
			squares[i].style.fill = '#ffffff';
		}
	document.getElementById('epidemicsStatus').innerHTML
		= "Status: (Idle) Infection status has been set to random.";
}

// 'onclick' event hanlder for 'Reset' button
// Functionality: reset infection status for all nodes
function resetButton_click() {
	for (var i = 0; i < squares.length; ++i)
	{
		squares[i].infected = false;
		squares[i].style.fill = '#ffffff';
	}
	document.getElementById('epidemicsStatus').innerHTML
		= "Status: (Idle) Infection status has been reset.";
}

/*
	********************************
		Graph helper functions
	********************************
*/

// This function calculates the id based on row and column
// Returns -1 on error (out of bound, etc)
function getId(row, column) {
	if (row < 0 || row >= numRows || column < 0 || column >= numColumns)
		return -1;
	return row + column * columnInterval;
}
