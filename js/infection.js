/*
    ********************************
        UI Button onclick events
    ********************************
*/

// This is the event hanlder for 'Run' button
// Functionality: Start the spread of epidemics
function run_click() {
    // TODO: implement epidemic development animation.
}

// This is the event hanlder for 'Reload' button
// Functionality: reload the page
function reload_click() {
    location.reload();
}

/*
    ********************************
        Graph helper functions
    ********************************
*/

// This function counts the number of neighbors the given node has
function countNeighbors(node) {
    var count = 0;
    // TODO: implemente this.
    return count;
}


/*
    ********************************
        Dropdown select box event handlers
    ********************************
*/

// This sets up the 'onchange' event handler for dropdown select boxes
function initSelectOnChange() {
    d3.select('#infectionSelect').on("change", infectionSelect_changed);
    d3.select('#thresholdSelect').on("change", thresholdSelect_changed);
}

// This updates the dropdown select boxes based on selected node
function updateSelectOptions() {
    if (!selected_node) // This function will only be called when a node is selected.
        return;

    // Build the infectionSelect dropdown menu

    // Clear existing options
    var iSelect = document.getElementById('infectionSelect');
    for(var i = iSelect.options.length - 1; i >= 0; --i)
    {
        iSelect.remove(i);
    }
    // Append new options
    var iOption1 = document.createElement("option");
    iOption1.text = "No";
    var iOption2 = document.createElement("option");
    iOption2.text = "Yes";
    iSelect.add(iOption1);
    iSelect.add(iOption2);
    iSelect.selectedIndex = selected_node.infected ? 1 : 0;

    // Build the thresholdSelect dropdown menu

    // get max threshold
    var numNeighbors = countNeighbors(selected_node);

    // Clear existing options
    var tSelect = document.getElementById('thresholdSelect');
    for(var j = tSelect.options.length - 1; j >= 0; --j)
    {
        tSelect.remove(j);
    }
    // Append new options
    for(var j = 0; j <= numNeighbors; ++j)
    {
        var option = document.createElement("option");
        option.text = j;
        tSelect.add(option);
    }
    tSelect.selectedIndex = selected_node.threshold;
}

// This restores dropdown select boxes when current node selection is cancelled/changed
function restoreSelectOptions() {
    var iSelect = document.getElementById('infectionSelect');
    for(var i = iSelect.options.length - 1; i >= 0; --i)
    {
        iSelect.remove(i);
    }
    var disabledOption1 = document.createElement("option");
    disabledOption1.text = "select a node";
    disabledOption1.disabled = true;
    iSelect.add(disabledOption1);

    var tSelect = document.getElementById('thresholdSelect');
    for(var j = tSelect.options.length - 1; j >= 0; --j)
    {
        tSelect.remove(j);
    }
    var disabledOption2 = document.createElement("option");
    disabledOption2.text = "select a node";
    disabledOption2.disabled = true;
    tSelect.add(disabledOption2);
}

// This is the 'onchange' event handler for infection select box
function infectionSelect_changed() {
    if (!selected_node)
        return;
    var sel = document.getElementById('infectionSelect');
    var value = sel.options[sel.selectedIndex].value;
    selected_node.infected = (value == 'Yes') ? true : false;
    restart();
}

// This is the 'onchange' event handler for infection select box
function thresholdSelect_changed() {
    var sel = document.getElementById('thresholdSelect');
    selected_node.threshold = sel.selectedIndex;
    restart();
}