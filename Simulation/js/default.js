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
	rounds: 1000
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

	var status = document.getElementById('status');
	status.style.color = '#00ff33';
	status.innerHTML = 'Simulation started.';

	var steps = simulation();

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

function simulation() {
	return 0;
}

/**
 * Data Transfer helper function
 */

function inputParams() {
	var pInput = document.getElementById('pInput');
	var rowInput = document.getElementById('rowInput');
	var columnInput = document.getElementById('columnInput');
	var roundInput = document.getElementById('roundInput');

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

	var rounds = parseInt(roundInput.value);
	if (isNaN(rounds) || rounds <= 0)
	{
		inputWarning('roundInput');
		return -1;
	}
	else
		params.rounds = rounds;

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