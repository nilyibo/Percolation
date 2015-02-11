/**
 * This file contains the function for running simulation of infection steps
 *
 * @file default.js
 * @author Yibo Guo (https://github.com/nilyibo)
 */

/**
 * Initial configuration
 */

var params = {	// Default parameter
	n: 6,
	r: 3,
	pmin: 0,
	pmax: 1,
	pstep: 0.01,
	rows: 10,
	columns: 10,
	simulations: 1000
};

var gridChanged = false;

function initPage() {
	var nSelect = document.getElementById('nSelect');
	var rSelect = document.getElementById('rSelect');
	nSelect.selectedIndex = 1;
	var n = parseInt(nSelect.options[nSelect.selectedIndex].value);
	for(var i = 0; i < n; ++i)
	{
		var option = document.createElement("option");
		option.text = i + 1;
		rSelect.options.add(option);
	}
	rSelect.selectedIndex = 2;
}

/**
 * UI event handler
 */

function runButton_click() {
	if (inputParams() == -1)
		return;

	var inputs = [
		document.getElementById('nSelect'),
		document.getElementById('rSelect'),
		document.getElementById('pminInput'),
		document.getElementById('pmaxInput'),
		document.getElementById('pstepInput'),
		document.getElementById('rowInput'),
		document.getElementById('columnInput'),
		document.getElementById('simulationInput')
	];

	// Disable parameter change
	for (var i = inputs.length - 1; i >= 0; i--)
		inputs[i].disabled = true;

	var status = document.getElementById('status');
	status.style.color = '#00ff33';
	status.innerHTML = 'Simulation started.';

	var fileContent = 'p, N, SD\n';
	for (var i = params.pmin; i < params.pmax; i += params.pstep) {
		var result = simulation(i);
		var steps = result.avg;
		var sd = result.sd;
		fileContent += (i + ', ' + steps + ', ' + sd + '\n');
	};

	downloadFile(fileContent);

	// Enable parameter change
	for (var i = inputs.length - 1; i >= 0; i--)
		inputs[i].disabled = false;

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

// Functionality: save the calculation result
function downloadFile(fileContent) {
    var download = window.document.createElement('a');
    download.href = window.URL.createObjectURL(new Blob([fileContent], {type: 'text/plain;charset=utf-8;'}));
    download.download = 'N(p).csv';    // File name

    // Append anchor to body temporarily to initiate download
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
}


/**
 * Simulation function
 */

// Run the whole simulation
function simulation(p) {
	var progress = document.getElementById('progressbar').children[0];
	var count = params.simulations;
	var sum = 0;
	var squareSum = 0;
	for (var i = 0; i < count; ++i)
	{
		var step = oneSimulation(p);
		sum += step;
		squareSum += step * step;
		progress.style.width = Math.ceil(i * 100 / count) + '%';
		var status = document.getElementById('status');
		status.innerHTML = 'Simulations completed: ' + i;
	}

	return {
		avg: sum / count,
		sd: Math.sqrt(squareSum / count - sum / count * sum / count)
	};
}

// Random initial seed
function buildGrid(p) {
	var grid = [];
	for (var i = 0; i < params.rows; ++i)
	{
		grid.push([]);
		for (var j = 0; j < params.columns; ++j)
			if (Math.random() < p)
				grid[i].push(true);
			else
				grid[i].push(false);
	}
	return grid;
}

// Run one simulation
function oneSimulation(p) {
	var grid = buildGrid(p);
	var oldGrid = [];
	var counter = 0;

	while (true)
	{
		oldGrid = grid;
		gridChanged = false;
		grid = oneRound(grid);
		if (!gridChanged)
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
			if (grid[i][j])
				newGrid[i].push(true);
			else if (countInfectedNeighbor(grid, i, j) >= params.r)
			{
				newGrid[i].push(true);
				gridChanged = true;
			}
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

		var count = 0;

		// Same for odd and even
		if (x > 0)
			count += (grid[x - 1][y]) ? 1 : 0;
		if (x + 1 < params.rows)
			count += (grid[x + 1][y]) ? 1 : 0;

		if (y % 2 == 0) // Odd column
		{
			if (y > 0)
			{
				count += (grid[x][y - 1]) ? 1 : 0;
				if (x > 0)
					count += (grid[x - 1][y - 1]) ? 1 : 0;
			}
			if (y + 1 < params.columns)
			{
				count += (grid[x][y + 1]) ? 1 : 0;
				if (x > 0)
					count += (grid[x - 1][y + 1]) ? 1 : 0;
			}
		}
		else	// Even column
		{
			if (y > 0)
			{
				count += (grid[x][y - 1]) ? 1 : 0;
				if (x + 1 < params.rows)
					count += (grid[x + 1][y - 1]) ? 1 : 0;
			}
			if (y + 1 < params.columns)
			{
				count += (grid[x][y + 1]) ? 1 : 0;
				if (x + 1 < params.rows)
					count += (grid[x + 1][y + 1]) ? 1 : 0;
			}
		}
		return count;
	}
	else	// Shouldn't happen
		return 0;
}

/**
 * Data Transfer helper function
 */

function inputParams() {
	var pminInput = document.getElementById('pminInput');
	var pmaxInput = document.getElementById('pmaxInput');
	var pstepInput = document.getElementById('pstepInput');
	var rowInput = document.getElementById('rowInput');
	var columnInput = document.getElementById('columnInput');
	var simulationInput = document.getElementById('simulationInput');

	var pmin = parseFloat(pminInput.value);
	if (isNaN(pmin) || pmin < 0 || pmin > 1)
	{
		inputWarning('pminInput');
		return -1;
	}
	else
		params.pmin = pmin;

	var pmax = parseFloat(pmaxInput.value);
	if (isNaN(pmax) || pmax < 0 || pmax > 1)
	{
		inputWarning('pmaxInput');
		return -1;
	}
	else
		params.pmax = pmax;

	var pstep = parseFloat(pstepInput.value);
	if (isNaN(pstep) || pstep < 0 || pstep > 1)
	{
		inputWarning('pstepInput');
		return -1;
	}
	else
		params.pstep = pstep;

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
