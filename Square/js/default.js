var globalThreshold = 1; // Initial threshold for all nodes

// global init function
function initSquareGrid()
{
	;
}

// 'onclick' event handler for each node
// Functionality: invert infection status.
function node_click(id)
{
	;
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
// Functionality: reset infection status for all nodes
function resetButton_click()
{
	;
}

