/**
 * This file contains the function for running the epidemics on hexagon grid
 *
 * @file default.js
 * @author Yibo G (https://github.com/nilyibo)
 */

var globalThreshold = 1; // Initial threshold for all hexagons
var hexagons;	// Holds the list of all polygons

// global init function
function initHexagonGrid() {
	// Init global variable hexagons
	hexagons = document.getElementsByTagName('polygon');
	// Add onclick event handler for all hexagons
	for (var i = 0; i < hexagons.length; ++i)
	{
		hexagons[i].infected = false;
		hexagons[i].style.fill = "#ffffff";
		hexagons[i].onclick = (function(){
			var id = hexagons[i].id;
			return function() { hexagon_click(id) };
		})();
	}
}

/*
	********************************
		UI Button onclick events
	********************************
*/

// 'onclick' event handler for each hexagon
// Functionality: invert infection status.
function hexagon_click(id) {
	var hexagon = document.getElementById(id);
	if (hexagon.infected)
	{
		hexagon.infected = false;
		hexagon.style.fill = '#ffffff';
	}
	else
	{
		hexagon.infected = true;
		hexagon.style.fill = '#ff0000';
	}
}

// 'onchange' event handler for threshold select
// Functionality: update global threshold.
function thresholdSelect_changed() {
	var threshold = parseInt(document.getElementById('thresholdSelect').value);
	if (threshold != NaN)
		globalThreshold = threshold;
}

// 'onclick' event hanlder for 'Run' button
// Functionality: Start the spread of epidemics.
function runButton_click() {
	epidemicsStatus.innerHTML = 'Status: (Running) Epidemics started';
	epidemicsStatus.style.color = '#ff0000';
	// Disable the button itself to prevent multiple epidemics running
	document.getElementById('runButton').disabled = true;
	document.getElementById('runButton').title = "Epidemics are already running.";
	document.getElementById('resetButton').disabled = true;
	document.getElementById('resetButton').title = "Epidemics are already running.";
	document.getElementById('randomButton').disabled = true;
	document.getElementById('randomButton').title = "Epidemics are already running.";
	// Disable selection change when epidemics start
	var tSelect = document.getElementById('thresholdSelect');
	tSelect.disabled = true;
	tSelect.title = "Selection change is disabled while epidemics are running.";
	// Disable 'onclick' event handler for all hexagons
	for (var i = 0; i < hexagons.length; ++i)
		hexagons[i].onclick = null;

	var noMoreChanges = false;
	var prevInfectionStatus = [], currInfectionStatus = getInfectionStatus();

	var intervalID, roundNo = 1;

	intervalID = setInterval(function() {
		epidemicsStatus.innerHTML = 'Status: (Running) Round ' + roundNo + '.';
		oneRoundSpread();
		prevInfectionStatus = currInfectionStatus;
		currInfectionStatus = getInfectionStatus();
		noMoreChanges = compareList(prevInfectionStatus, currInfectionStatus);
		++roundNo;

		// Change color gradually
		var subIntervalID,
			progress = 0;	// steps of color transition (0 ~ 1)
		subIntervalID = setInterval(function() {
			// update color
			var infectedColor = '#ff0000', nonInfecColor = '#ffffff';
			for (var i = 0; i < hexagons.length; ++i)
				if (prevInfectionStatus[hexagons[i].id] != currInfectionStatus[hexagons[i].id])
					hexagons[i].style.fill = mixColor(infectedColor, nonInfecColor, progress + 0.025);
			// update counter
			progress += 0.025;
			if (progress >= 1)
				clearInterval(subIntervalID);
		}, 10); // Update color every 10 ms for 40 times.

		if (noMoreChanges)
		{
			clearInterval(intervalID);
			// Re-enable 'onclick' event handler for all hexagons
			for (var i = 0; i < hexagons.length; ++i)
				hexagons[i].onclick = (function(){
					var id = hexagons[i].id;
					return function() { hexagon_click(id) };
				})();
			// Re-enable selection change after epidemics end
			tSelect.title = "";
			tSelect.disabled = false;
			// Re-enable this button
			document.getElementById('randomButton').title = "Random initial condition.";
			document.getElementById('randomButton').disabled = false;
			document.getElementById('resetButton').title = "Reset infection status.";
			document.getElementById('resetButton').disabled = false;
			document.getElementById('runButton').title = "Start epidemics!";
			document.getElementById('runButton').disabled = false;
			epidemicsStatus.innerHTML = 'Status: (Idle) Epidemics stopped after '
				+ (roundNo - 2) + ' rounds.';
			epidemicsStatus.style.color = '#000000';
		}
	}, 1000);
}

// 'onclick' event hanlder for 'Random' button
// Functionality: randomly infect some hexagons
function randomButton() {
	var inputNumber = prompt(
		"Please enter a probability to randomly infect all hexagons.", "0.5");
	var probability = Number(inputNumber);

	if (isNaN(probability) || probability < 0 || probability > 1)
	{
		alert("Illegal probability!");
	}
	for (var i = 0; i < hexagons.length; ++i)
		if (Math.random() < probability)
		{
			hexagons[i].infected = true;
			hexagons[i].style.fill = '#ff0000';
		}
		else
		{
		hexagons[i].infected = false;
		hexagons[i].style.fill = '#ffffff';
		}
	document.getElementById('epidemicsStatus').innerHTML
		= "Status: (Idle) Infection status has been set to random.";

}

// 'onclick' event hanlder for 'Reset' button
// Functionality: reset infection status for all hexagons
function resetButton_click() {
	for (var i = 0; i < hexagons.length; ++i)
	{
		hexagons[i].infected = false;
		hexagons[i].style.fill = '#ffffff';
	}
	document.getElementById('epidemicsStatus').innerHTML
		= "Status: (Idle) Infection status has been reset.";
}

/*
	********************************
		General helper functions
	********************************
*/

// This function return a list of booleans indicating whether each node is infected
function getInfectionStatus() {
	var infectionStatus = [];
	for (var i = 0; i < hexagons.length; ++i)
		infectionStatus[hexagons[i].id] = hexagons[i].infected;
	return infectionStatus;
}

// This function check whether two lists have the same elements
function compareList(list1, list2) {
	if (list1.length != list2.length)
		return false;
	for (var i = 0; i < list1.length; ++i)
		if(list1[i] != list2[i])
			return false;
	return true;
}

// This converts decimal rgb number to a two-digit hex number
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

// This converts rgb to its hex string
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// This function convert a hex color code into its rgb components
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

// This will return a hex color of percentage * color1 + (1 - percentage) * color2
function mixColor(color1, color2, percentage) {
	var rgb1 = hexToRgb(color1), rgb2 = hexToRgb(color2);
	var r = Math.floor(rgb1.r * percentage + rgb2.r * (1 - percentage)),
		g = Math.floor(rgb1.g * percentage + rgb2.g * (1 - percentage)),
		b = Math.floor(rgb1.b * percentage + rgb2.b * (1 - percentage));
	return rgbToHex(r, g, b);
}

/*
	********************************
		Graph helper functions
	********************************
*/

// Core function to simulate one round of epidemics spread
// This also updates currInfectionStatus
function oneRoundSpread() {
	var nextRoundInfected = [];
	for (var i = 0; i < hexagons.length; ++i)
	{
		if (hexagons[i].infected)
			nextRoundInfected[hexagons[i].id] = true;
		else if (countInfectedNeighbors(hexagons[i]) >= globalThreshold)
			nextRoundInfected[hexagons[i].id] = true;
		else
			nextRoundInfected[hexagons[i].id] = false;
	}
	for (var i = 0; i < hexagons.length; ++i)
		hexagons[i].infected = nextRoundInfected[hexagons[i].id];
}

// This function returns the number of infected neighbors
function countInfectedNeighbors(hexagon)
{
	var neighborsId = getNeighborsId(hexagon);
	var count = 0;
	for (var i = 0; i < hexagons.length; ++i)
		for (var j = 0; j < neighborsId.length; ++j)
			if (hexagons[i].infected && hexagons[i].id == neighborsId[j])
				++count;
	return count;
}

// Get the list of the given node's neighbors's id
function getNeighborsId(hexagon)
{
	var currId = parseInt(hexagon.id);
	if (isNaN(currId))
		return [];

	var row = currId % 20;
	var column = Math.floor(currId / 20);
	var odd = (column % 2 == 1);

	// push all neighbors (don't check boundary for now)
	var neighbors = [];
	// Same for odd and even column
	neighbors.push(getId(row - 1, column));
	neighbors.push(getId(row + 1, column));
	if (odd)	// Odd column
	{
		neighbors.push(getId(row, column - 1));
		neighbors.push(getId(row + 1, column - 1));
		neighbors.push(getId(row, column + 1));
		neighbors.push(getId(row + 1, column + 1));
	}
	else		// Even column
	{
		neighbors.push(getId(row - 1, column - 1));
		neighbors.push(getId(row, column - 1));
		neighbors.push(getId(row - 1, column + 1));
		neighbors.push(getId(row, column + 1));
	}

	// Removes out of bound neighbors
	var legalNeighbors = [];
	for (var i = 0; i < neighbors.length; ++i)
		if (neighbors[i] != -1)
			legalNeighbors.push(neighbors[i]);
	return legalNeighbors;
}

// This function calculates the id based on row and column
// Returns -1 on error (out of bound, etc)
function getId(row, column)
{
	if (row < 0 || row >= numRows || column < 0 || column >= numColumns)
		return -1;
	return row + column * columnInterval;
}
