/**
 * This file contains the function for running simulation of infection steps
 *
 * @file default.js
 * @author Yibo G (https://github.com/nilyibo)
 */

/**
 * Initial configuration
 */

var params = {	// Default parameter
	n: 4,
	r: 1,
	p: 0.5,
	rows: 10,
	columns: 10,
	simulations: 1000
};

function initPage() {
	var nSelect = document.getElementById('nSelect');
	var rSelect = document.getElementById('rSelect');
	var n = parseInt(nSelect.options[nSelect.selectedIndex].value);
	for(var i = 0; i < n; ++i)
	{
		var option = document.createElement("option");
		option.text = i + 1;
		rSelect.options.add(option);
	}
}

/**
 * UI event handler
 */

function runButton_click() {
	var errorCode = inputParams();
	if (errorCode == -1)
		return;

	// TODO: Disable parameter change

	var status = document.getElementById('status');
	status.style.color = '#00ff33';
	status.innerHTML = 'Simulation started.';

	var steps = simulation();

	// TODO: Enable parameter change

	status.style.color = '#000000';
	status.innerHTML = 'Simulation ended.';
	alert('average steps: ' + steps);
}

function nSelect_changed() {
	var nSelect = document.getElementById('nSelect');
	params.n = parseInt(nSelect.options[nSelect.selectedIndex].value);

	var rSelect = document.getElementById('rSelect');
	var selectedIndex = rSelect.selectedIndex;
	for(var i = rSelect.options.length - 1; i >= 0; --i)
	{
		rSelect.remove(i);
	}

	for(var i = 0; i < params.n; ++i)
	{
		var option = document.createElement("option");
		option.text = i + 1;
		rSelect.options.add(option);
	}

	if (selectedIndex < params.n)
		rSelect.selectedIndex = selectedIndex;
	else
	{
		rSelect.selectedIndex = params.n - 1;
		params.r = params.n;	// Choose the largest possible one
	}
}

function rSelect_changed() {
	var rSelect = document.getElementById('rSelect');
	params.r = parseInt(rSelect.options[rSelect.selectedIndex].value);
}

function inputKeyDown(event) {
	if (event.keyCode == 13)	// 'Enter' key
		document.getElementById('runButton').click();
}

/**
 * Simulation function
 */

// Run the whole simulation
function simulation() {
	var progress = document.getElementById('progressbar').children[0];
	var sum = 0;
	for (var i = 0; i < params.simulations; ++i)
	{
		sum += oneSimulation();
		progress.style.width = Math.ceil(i * 100 / params.simulations) + '%';
		var status = document.getElementById('status');
		status.innerHTML = 'Simulations completed: ' + i;
	}
	return sum / params.simulations;
}

// Random initial seed
function buildGrid() {
	var grid = [];
	for (var i = 0; i < params.rows; ++i)
	{
		grid.push([]);
		for (var j = 0; j < params.columns; ++j)
			if (Math.random() < params.p)
				grid[i].push(true);
			else
				grid[i].push(false);
	}
	return grid;
}

// Run one simulation
function oneSimulation() {
	var grid = buildGrid();
	var oldGrid = [];
	var counter = 0;

	while (true)
	{
		oldGrid = grid;
		grid = oneRound(grid);
		if (compareGrid(grid, oldGrid))
			break;
		++counter;
	}
	return counter;
}

// One round of infection spread, updates grid
function oneRound(grid) {
	var newGrid = [];
	for (var i = 0; i < grid.length; ++i)
	{
		newGrid.push([]);
		for (var j = 0; j < grid[0].length; ++j)
			if (grid[i][j] || countInfectedNeighbor(grid, i, j) >= params.r)
				newGrid[i].push(true);
			else
				newGrid[i].push(false);
	}

	return newGrid;
}

function copyGrid(grid) {
	var result = [];
	for (var i = 0; i < grid.length; ++i)
	{
		result.push([]);
		for (var j = 0; j < grid[i].length; ++j)
			result[i].push(grid[i][j]);
	}
	return result;
}

// Check whether two grids have the same infection status
function compareGrid(grid1, grid2) {
	if (grid1.length != grid2.length)
		return false;

	for (var i = 0; i < grid1.length; ++i)
	{
		if (grid1[i].length != grid2[i].length)
			return false;
		for (var j = 0; j < grid1[i].length; ++j)
			if (grid1[i][j] != grid2[i][j])
				return false;
	}

	return true;
}

function countInfectedNeighbor(grid, x, y) {
	if (params.n == 4)	// Square grid
	{
		var count = 0;
		if (x > 0)
			count += (grid[x - 1][y]) ? 1 : 0;
		if (y > 0)
			count += (grid[x][y - 1]) ? 1 : 0;
		if (x + 1 < params.rows)
			count += (grid[x + 1][y]) ? 1 : 0;
		if (y + 1 < params.columns)
			count += (grid[x][y + 1]) ? 1 : 0;
		return count;
	}
	else if (params.n == 6)	// Hexagon grid
	{
		// Assume in hexagon grid,
		// odd columns are half above even columns
		if (y % 2 == 0) // Odd column
		{
			;
		}
		else	// Even column
		{
			;
		}
		return 0; // TODO: change this
	}
	else	// Shouldn't happen
		return 0;
}

/**
 * Data Transfer helper function
 */

function inputParams() {
	var pInput = document.getElementById('pInput');
	var rowInput = document.getElementById('rowInput');
	var columnInput = document.getElementById('columnInput');
	var simulationInput = document.getElementById('simulationInput');

	var p = parseFloat(pInput.value);
	if (isNaN(p) || p < 0 || p > 1)
	{
		inputWarning('pInput');
		return -1;
	}
	else
		params.p = p;

	var rows = parseInt(rowInput.value);
	if (isNaN(rows) || rows <= 0)
	{
		inputWarning('rowInput');
		return -1;
	}
	else
		params.rows = rows;

	var columns = parseInt(columnInput.value);
	if (isNaN(columns) || columns <= 0)
	{
		inputWarning('columnInput');
		return -1;
	}
	else
		params.columns = columns;

	var simulations = parseInt(simulationInput.value);
	if (isNaN(simulations) || simulations <= 0)
	{
		inputWarning('simulationInput');
		return -1;
	}
	else
		params.simulations = simulations;

	return 0;	// No error in parameters
}

/**
 * General helper function
 */
function inputWarning(id) {
	var status = document.getElementById('status');
	status.innerHTML = 'Invalid parameter.';
	status.style.color = '#ff0000';

	var input = document.getElementById(id);
	input.select();
}