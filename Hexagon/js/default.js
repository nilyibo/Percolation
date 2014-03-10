var globalThreshold = 1; // Initial threshold for all hexagons
var hexagons;	// Holds the list of all polygons

// global init function
function initHexagonGrid()
{
	// Init global variable hexagons
	hexagons = document.getElementById('hexes').children;
	// Add onclick event handler for all hexagons
	for (var i = 0; i < hexagons.length; ++i)
	{
		hexagons[i].style.fill = "#ffffff";
		hexagons[i].onclick = (function(){
			alert('u clicked me');
			var id = hexagons[i].id;
			return function() { hexagon_click(id) };
		})();
	}
}

// 'onclick' event handler for each hexagon
// Functionality: invert infection status.
function hexagon_click(id)
{
	var hexagon = document.getElementById(id);
	if (hexagon.style.fill == '#ffffff')
		hexagon.style.fill = '#ff0000';
	else
		hexagon.style.fill = '#ffffff';
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

// 'onclick' event hanlder for 'Reset' button
// Functionality: reset infection status for all hexagons
function resetButton_click()
{
	for (var i = 0; i < hexagons.length; ++i)
		hexagons[i].style.fill = '#ffffff';
	alert('Infection has been reset.');
}

