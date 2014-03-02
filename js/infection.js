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
    epidemicsStatus.innerText = 'Status: (Running) Epidemics started';
    // Disable the button itself to prevent multiple epidemics running
    document.getElementById('runButton').disabled = true;
    document.getElementById('runButton').title = "Epidemics are already running.";
    // Disable selection change when epidemics start
    restoreSelectOptions();
    var iSelect = document.getElementById('infectionSelect');
    var tSelect = document.getElementById('thresholdSelect');
    iSelect.disabled = true;
    tSelect.disabled = true;
    iSelect.title = "Selection change is disabled while epidemics are running.";
    tSelect.title = "Selection change is disabled while epidemics are running.";
    // Remove node/edge selection temporarily.
    var currSelectedNode = selected_node;
    var currSelectedEdge = selected_link;
    selected_node = null;
    selected_link = null;
    restart();

    var noMoreChanges = false;
    var prevInfectionStatus = [], currInfectionStatus = getInfectionStatus();

    var intervalID, roundNo = 1;

    intervalID = setInterval(function() {
        epidemicsStatus.innerText = 'Status: (Running) Round ' + roundNo + '.';
        oneRoundSpread();
        prevInfectionStatus = currInfectionStatus;
        currInfectionStatus = getInfectionStatus();
        noMoreChanges = compareList(prevInfectionStatus, currInfectionStatus);
        ++roundNo;

        // Change color gradually
        var subIntervalID,
            progress = 0;   // steps of color transition (0 ~ 1)
        subIntervalID = setInterval(function() {
            circle.selectAll('circle')
                .style('fill', function(d) {
                    var infectedColor = "#f62217", nonInfecColor = "#5cb3ff";
                    if (prevInfectionStatus[d.id] == currInfectionStatus[d.id])
                        return (d.infected ? infectedColor : nonInfecColor);
                    else    // Just got infected
                        return mixColor(infectedColor, nonInfecColor, progress + 0.025);
                })
                .style('stroke', function(d) {
                    var infectedColor = d3.rgb("#f62217").darker().toString(),
                        nonInfecColor = d3.rgb("#5cb3ff").darker().toString();
                    if (prevInfectionStatus[d.id] == currInfectionStatus[d.id])
                        return (d.infected ? infectedColor : nonInfecColor);
                    else    // Just got infected
                        return mixColor(infectedColor, nonInfecColor, progress + 0.025);
                });
            progress += 0.025;
            if (progress >= 1)
                clearInterval(subIntervalID);
        }, 10); // Update color every 20 ms for 40 times.

        if (noMoreChanges)
        {
            clearInterval(intervalID);
            // Restore selected node/edge
            selected_node = currSelectedNode;
            selected_link = currSelectedEdge;
            restart();
            // Re-enable selection change after epidemics end
            iSelect.title = "";
            tSelect.title = "";
            iSelect.disabled = false;
            tSelect.disabled = false;
            updateSelectOptions();
            // Re-enable this button
            document.getElementById('runButton').title = "Start epidemics!";
            document.getElementById('runButton').disabled = false;
            epidemicsStatus.innerText = 'Status: (Idle) Epidemics stopped.';
        }
    }, 1000);
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
        infectionStatus[nodes[i].id] = nodes[i].infected; // Node is identified by id, not by index
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
        if (j == 0)
            option.disabled = true;
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
    var backup = [nodes, lastNodeId, links, selected_node, selected_link];
    // Clear existing graph
    nodes = [];
    lastNodeId = 0;
    links = [];
    restart();

    // Clear node/link selection
    selected_node = null;
    selected_link = null;
    restoreSelectOptions();

    fileContent = evt.target.result;
    // General validity check
    if (fileContent.match(/[^\d\[\]\(\)\,\n\s]/g) != null)
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
    selected_node = backup[3];
    selected_link = backup[4];
    restart();
    updateSelectOptions();
    alert('[Error]: ' + message);
    return;
}