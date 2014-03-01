/**
 * This file contains the function for running the epidemics
 *
 * @file infection.js
 * @author Yibo G (https://github.com/nilyibo)
 */

/*
    ********************************
        UI Button onclick events
    ********************************
*/

// This is the onclick event hanlder for 'Run' button
// Functionality: Start the spread of epidemics
function run_click() {
    var iSelect = document.getElementById('infectionSelect');
    var tSelect = document.getElementById('thresholdSelect');
    // Disable selection change when epidemics start
    iSelect.disabled = true;
    tSelect.disabled = true;
    iSelect.title = "Selection change is disabled while epidemics are running.";
    tSelect.title = "Selection change is disabled while epidemics are running.";

    var noMoreChanges = false;
    var prevInfectionStatus = [], currInfectionStatus = [];

    while (!noMoreChanges) // Continue to run epidemics until there are no more changes.
    {
        oneRoundSpread();
        prevInfectionStatus = currInfectionStatus;
        currInfectionStatus = getInfectionStatus();
        noMoreChanges = compareList(prevInfectionStatus, currInfectionStatus);
    }

    // Re-enable selection change after epidemics end
    iSelect.disabled = false;
    tSelect.disabled = false;
    iSelect.title = "";
    tSelect.title = "";
}

// This is the onclick event hanlder for 'Reload' button
// Functionality: reload the page
function reload_click() {
    location.reload();
}

/*
    ********************************
        General helper functions
    ********************************
*/

// This function return a list of booleans indicating whether each node is infected
function getInfectionStatus() {
    var infectionStatus = [];
    for (var i = 0; i < nodes.length; ++i)
    {
        infectionStatus.push(nodes[i].infected);
        restart();
    }
    return infectionStatus;
}

// Thsi function check whether two lists have the same elements.
function compareList(list1, list2) {
    if (list1.length != list2.length)
        return false;
    for (var i = 0; i < list1.length; ++i)
        if(list1[i] != list2[i])
            return false;
    return true;
}

/*
    ********************************
        Graph helper functions
    ********************************
*/

// Core function to simulate one round of epidemics spread
function oneRoundSpread() {
    var nextRoundInfected = [];
    for (var i = 0; i < nodes.length; ++i)
    {
        if (nodes[i].infected)
            nextRoundInfected.push(true);
        else if (countInfectedNeighbors(nodes[i]) >= nodes[i].threshold)
            nextRoundInfected.push(true);
        else
            nextRoundInfected.push(false);
    }
    for (var i = 0; i < nodes.length; ++i)
        nodes[i].infected = nextRoundInfected[i];
}

// This function counts the number of neighbors the given node has
function countNeighbors(node) {
    var count = 0;
    for (var i = 0; i < links.length; ++i)
    {
        if (node === links[i].source)
            ++count;
        if (node === links[i].target)
            ++count;
    }
    return count;
}

// This function counts the number of neighbors the given node has
function countInfectedNeighbors(node) {
    var count = 0;
    for (var i = 0; i < links.length; ++i)
    {
        if (node === links[i].source && links[i].target.infected)
            ++count;
        if (node === links[i].target && links[i].source.infected)
            ++count;
    }
    return count;
}

function decrementNeighborsMaxThreshold(node) {
    for (var i = 0; i < links.length; ++i)
    {
        if (node === links[i].source)
        {
            var neighbor = links[i].target;
            if (neighbor.threshold == countNeighbors(neighbor) && neighbor.threshold != 1)
                --neighbor.threshold;
            continue;
        }
        if (node === links[i].target)
        {
            var neighbor = links[i].source;
            if (neighbor.threshold == countNeighbors(neighbor) && neighbor.threshold != 1)
                --neighbor.threshold;
            continue;
        }
    }
}

function decrementLinkEndsMaxThreshold(link) {
    // decrement threshold for nodes of the link to be removed if it's at max threshold
    if (link.source.threshold == countNeighbors(link.source) && link.source.threshold != 1) 
      --link.source.threshold;
    if (link.target.threshold == countNeighbors(link.target) && link.target.threshold != 1) 
      --link.target.threshold;
}

/*
    ********************************
        Event handlers
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
    var maxThreshold = Math.max(countNeighbors(selected_node), 1); // 0 threshold is not allowed, minimum is 1.

    // Clear existing options
    var tSelect = document.getElementById('thresholdSelect');
    for(var j = tSelect.options.length - 1; j >= 0; --j)
    {
        tSelect.remove(j);
    }
    // Append new options
    for(var j = 0; j <= maxThreshold; ++j)
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

// This is the onchange event handler for file selector
// Functionality: Show the chosen file and update the graph accordingly
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var output = [];  // files is a FileList of File objects. List some properties.
    var f; // File
    if (f = files[0]) {
        output.push('<strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');
    }
    document.getElementById('list').innerHTML = output.join('');

    var reader = new FileReader();
    reader.onload = parseGraphFile;     // Parse the file once completed loading
    reader.readAsText(f, 'UTF-8');      // Read the file as text
}

var fileContent;
var firstLine;

// This function will parse the uploaded file and update the graph accordingly
function parseGraphFile(evt)
{
    // Back up current nodes/links list
    var backup = [nodes, lastNodeId, links];
    // Clear existing graph
    nodes = [];
    lastNodeId = 0;
    links = [];
    restart();

    fileContent = evt.target.result;
    // General validity check
    if (fileContent.match(/[^0123456789\[\]\(\)\,\n\s]/g) != null)
    {
        parseGraphFailed(backup, 'Illegal character!\nOnly digits, brackets, parentheses and commas are allowed.');
        return;
    }
    var countNewLines = fileContent.match(/\n/g);
    if (countNewLines == null || countNewLines.length < 2)
    {
        parseGraphFailed(backup, 'Must have at least three lines.');
        return;
    }

    // Get the first line
    var newLine = fileContent.search('\n');
    firstLine = fileContent.substr(0, newLine);
    fileContent = fileContent.substr(newLine + 1);
    // Get the second line
    newLine = fileContent.search('\n');
    var secondLine = fileContent.substr(0, newLine);
    // Get the third line
    fileContent = fileContent.substr(newLine + 1);
    newLine = fileContent.search('\n');
    var thirdLine = (newLine == -1) ? fileContent : fileContent.substr(0, newLine);
    // Check the rest
    if (newLine != -1)
    {
        fileContent = fileContent.substr(newLine + 1);
        if (fileContent.length != 0)
            alert('[Warning] Ignoring any input after line 3.');
    }

    // Check node list validity
    var match1 = firstLine.match(/\,/g), match3 = thirdLine.match(/\,/g);
    if ((match1 != null && match3 == null) || (match1 == null && match3 != null)    // one is null and the other is not
        || (match1 != null && match3 != null && (match1.length != match3.length)) ) // both are not null and length differ
    {
        parseGraphFailed(backup, 'Number of nodes is not equal to number of thresholds.');
        return;
    }
    var nodeCount = (firstLine.match(/\,/g) == null) ? 1 : (firstLine.match(/\,/g).length + 1);
    var index1 = firstLine.search(/\[/g);
    var index3 = thirdLine.search(/\[/g);
    if (index1 == -1 || index3 == -1 || firstLine.search(/\]/g) == -1 || thirdLine.search(/\]/g) == -1)
    {
        parseGraphFailed(backup, 'Node/Threshold line is not a bracked-enclosed list.');
        return;
    }

    // Start updating nodes list
    for (var i = 0; i < nodeCount; ++i)
    {
        firstLine = firstLine.substr(index1 + 1);
        thirdLine = thirdLine.substr(index3 + 1);
        // The last one ends with ']'
        index1 = firstLine.search((i == nodeCount - 1) ? ']' : ',');
        index3 = thirdLine.search((i == nodeCount - 1) ? ']' : ',');
        var currId = parseInt(firstLine.substr(0, index1));
        var currThreshold = parseInt(thirdLine.substr(0, index3));
        if (isNaN(currId) || isNaN(currThreshold))
        {
            parseGraphFailed(backup, 'Node id / Threshold is an illegal number.');
            return;
        }
        nodes.push({id: currId, reflexive: false, infected: false, threshold: currThreshold});
        ++lastNodeId;
    }

    // Check link list validity
    if (secondLine.search(/\[/g) == -1 || secondLine.search(']') == -1)
    {
        parseGraphFailed(backup, 'Link line is not a bracked-enclosed list.');
        return;
    }

    // Start updating links list
    var linkCount = (secondLine.match(/\(/g) == null) ? 0 : (secondLine.match(/\(/g).length);
    var index2 = secondLine.search(/\[/g);
    for (var i = 0; i < linkCount; ++i)
    {
        index2 = secondLine.search(/\(/g);
        secondLine = secondLine.substr(index2 + 1);
        // The last one ends with ']'
        index2 = secondLine.search(',');
        var currSrc = parseInt(secondLine.substr(0, index2));
        secondLine = secondLine.substr(index2 + 1);
        index2 = secondLine.search(/\)/g);
        var currTar = parseInt(secondLine.substr(0, index2));
        secondLine = secondLine.substr(index2 + 1)
        if (isNaN(currSrc) || isNaN(currTar))
        {
            parseGraphFailed(backup, 'Link Src/Dest is an illegal node id.');
            return;
        }
        links.push({source: nodes[currSrc], target: nodes[currTar], left: true, right: true});
    }

    // init D3 force layout
    force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick)

    // Reload the graph
    restart();
}

function parseGraphFailed(backup, message)
{
    nodes = backup[0];
    lastNodeId = backup[1];
    links = backup[2];
    alert('[Error]: ' + message);
    return;
}