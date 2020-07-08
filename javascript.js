var allPanelsVisible = false;	//whether or not the show/hide all has been clicked yet
var validPanels = [];

////////////////////////////////
//prepare the starting screen
////////////////////////////////

function getData()
{
	fetch("./DOSkeywords.json")	//retrieve data from keywords JSON
		.then(function(resp) {
			return resp.json();
		})
		.then(function(data) {
			for (i = 0; i < data.length; i++) { //data.length
				makePanels(i, data);
			}
		})
		.then(function() {
			toggleLoading();
		});
}

function makePanels(index, data)
{
	//set up html structure
	var panelGroup = document.querySelector('#group');	//link to html
	let panel = document.createElement("div");
	panel.classList.add("panel", "panel-default");
	panel.setAttribute("id", "panel");
	let heading = document.createElement("div");
	heading.classList.add("panel-heading");
	heading.setAttribute("id", "heading");
	let body = document.createElement("div");
	body.classList.add("panel-body");
	body.setAttribute("id", "body");
	let footer = document.createElement("div");
	footer.classList.add("panel-footer");
	footer.setAttribute("id", "footer");
	let ranking = document.createElement("ranking");
	ranking.textContent = "Percent Match";
	ranking.setAttribute("id", "ranking");
	let progress = document.createElement("div");		
	progress.classList.add("progress");
	progress.style.height = "15px";
	let progressBar = document.createElement("div");
	progressBar.classList.add("progress-bar", "bg-info");
	progressBar.style.height = "15px";	

	//assign disease name to header
	disease = Object.keys(data[index]);
	heading.innerHTML = disease;
	panel.appendChild(heading);

	//assign keywords to body as tags
	keywords = Object.values(data[index]);
	for (j = 0; j < keywords[0].length; j++) {	//requires [0] because Object creates an array with the 1st having all the data
		makeTags(j, body);
	}

	//append components to be visible
	panel.appendChild(body);
	footer.appendChild(ranking);
	progress.appendChild(progressBar);
	footer.appendChild(progress);
	panel.appendChild(footer);
	panel.style.display = "none";	//reduce rendering time
	panelGroup.appendChild(panel);
}

function makeTags(index, body)
{
	let tag = document.createElement("p");
	tag.textContent = keywords[0][index];	//requires [0] because Object creates an array with the 1st having all the data
	tag.setAttribute("id", "tag");
	// tag.style.backgroundColor = generateRandomColor();
	tag.style.backgroundColor = generateColor(tag.textContent);
	body.appendChild(tag);	//append each tag to the body
}

function generateColor(tagTextValue) {
	cardiovascularWords = ["plasma", "blood", "heart",
							"arter", "thrombus", "myocardial",
							"coronary", "vessel", "erythrocytes",
							"platelet", "thrombo", "hemoglobin",
							"vasculature", "embolus", "cardiac", 
							"cardiovascular", "bleed", "vein",
							"aneurysm", "aort", "vena cava",
							"atrium", "atrial", "ventric", "systol",
							"diastol", "arrhythmia"];
	if (contains(tagTextValue, cardiovascularWords) == true) {
		return "#f94144";
	}
	else {
		return "#968AE5";
	}
}

function contains(tagTextValue, characteristicWords)
{
	match = false;
    characteristicWords.forEach(function(word) {
    	if (tagTextValue.toLowerCase().indexOf(word) > -1) {
    	    // console.log(tagTextValue + " : " + word);
    		match = true;
    	}
    }); 
    return match;   
}

function generateRandomColor()
{
	var colors = ["#C68DCE","#968AE5","#8FB8ED", "#62BFED", "#3590f3", "#0B63C1", "#116792", "#5A47D7", "#A049AB"];	//manually selected color pallete              
	var randomColor = Math.floor(Math.random() * colors.length);	//pick random color index
  	return colors[randomColor];
}

function toggleLoading() {
	overlay = document.getElementById("overlayBackground");
	if (overlay.style.display == "none") {	//if overlay isn't already visible show it
		overlay.style.display = "";
	}
	else {
		overlay.style.display = "none";
	}
}

/////////////////////////
//search functionality
/////////////////////////

function isFilledOut() {
	searchBars = document.getElementsByTagName("input");
	for (i = 0; i < searchBars.length; i++) {	//check all search bars for queries
		query = searchBars[i].value;
		if (query == "") {
			alert("All queries must be filled out");	//prevent user from searching "" if no query is added
			return;	//don't proceed if empty search bar
		}
	}
	delaySearch();	//proceed if all search bars are filled out
}

function delaySearch() {
	toggleLoading();
	setTimeout(function() {	//have to delay or else it will try to run before the loader appears, freezing everything else
		filterFunction();
	}, 200);
	setTimeout(function() {	//have to delay or else it resets the display too fast and the loader doesn't seem to appear
		toggleLoading();
	}, 200);
}

function filterFunction() {

	//reset previous highlighting from different queries
	for (i = 0; i < validPanels.length; i++) {
		resetHighlight(validPanels[i]);
	}

	filterWords = getFilterWords();	//retrieve query/queries to compare data with
	validPanels = [];	//initialize approved panels
	allPanels = document.getElementsByClassName("panel");  //retrieve all panels

	//deal with initial query
	for (m = 0; m < allPanels.length; m++) {
		panel = allPanels[m];
		panel.style.display = "none";	//reset what is shown with each search
		checkHeadingAndTags(panel, filterWords, 0, validPanels);
	}

	//deal with additional queries if they exist
	if (filterWords.length > 1) {
		for (q = 1; q < filterWords.length; q++) {  //q = 1 to account for initial query without operator
			
			//case 1: logic for AND operator
			if (filterWords[q].type == "and") {
				updatedValidPanels = [];	//create temporary array that refreshes with each query to be checked
				for (v = 0; v < validPanels.length; v++) {	//AND narrows the results so check the ones already approved
					panel = validPanels[v];
					panel.style.display = "none";	//reset what is shown with each search
					checkHeadingAndTags(panel, filterWords, q, updatedValidPanels);
				}
				validPanels = [];	//reset array to be re-populated
				validPanels = updatedValidPanels;	//replace array with narrower results
			}

			//case 2: logic for OR operator
			if (filterWords[q].type == "or") {
				for (x = 0; x < allPanels.length; x++) {	//OR expands the results so check all the panels again
					panel = allPanels[x];
					panel.style.display = "none";	//reset what is shown with each search
					checkHeadingAndTags(panel, filterWords, q, validPanels);
				}
			}
		}
	}

	displayValidPanelsInOrder(validPanels, filterWords)

	reorderPanels(validPanels);

	numberOfResults();	//update the counter based on how many the search applied to
}

function resetHighlight(panel) {
	heading = panel.getElementsByClassName("panel-heading");    
	heading[0].innerHTML = heading[0].textContent;

	tags = panel.getElementsByTagName("p"); //check each panel's tags independent of other panels
	for (n = 0; n < tags.length; n++) {
		tag = tags[n];
		tag.innerHTML = tag.textContent;
	}
}

function getFilterWords() {
	inputs = document.getElementsByTagName("input");
	filterWords = [];
	for (p = 0; p < inputs.length; p++) {
		input = inputs[p];
		filterWord = input.value.toLowerCase();
		filterWords.push({
			"type": input.id,	//allows for determination of logic for AND/OR cases
			"query": filterWord
		});
	}
	return filterWords;
}

function checkHeadingAndTags(panel, filterWords, queryIndex, panelList) {
	//check headings first
	heading = panel.getElementsByClassName("panel-heading");    
	headingTextValue = heading[0].textContent; //have to use [0] to access list of one item (header) because of getElements
	isMatch = headingTextValue.toLowerCase().indexOf(filterWords[queryIndex].query);   //returns int > -1 to indicate index of where the query was found in the textValueindex
	if (isMatch > -1) {
		highlightQuery(heading[0], isMatch, filterWords, queryIndex);	//should only highlight first occurence (would probably be better to highlight all occurences)
		if (panelList.includes(panel) == false) {	//add to array if not already an approved panel
			panelList[panelList.length] = panel;	//required instead of push to be able to have length updated (has to be numerical index)
		}
	}

	//check tags next
	tags = panel.getElementsByTagName("p"); //check each panel's tags independent of other panels
	for (n = 0; n < tags.length; n++) {
		tag = tags[n];
		tagTextValue = tag.textContent;   //retrieves a tag's text to compare
		isMatch = tagTextValue.toLowerCase().indexOf(filterWords[queryIndex].query);  //returns int > -1 to indicate index of where the query was found in the textValue
		if (isMatch > -1) {
			highlightQuery(tag, isMatch, filterWords, queryIndex);
			if (panelList.includes(panel) == false) {	//add to array if not already an approved panel
				panelList[panelList.length] = panel;	//required instead of push to be able to have length updated (has to be numerical index)
			}
		}
	}
}

function highlightQuery(target, startQueryIndex, filterWords, queryIndex) {
	var original = target.innerHTML;
	var wordToHighlight = filterWords[queryIndex].query;
	endQueryIndex = startQueryIndex + wordToHighlight.length;
	wordToHighlight = wordToHighlight.replace(/[.*+?^${}()|[\]\\]/gi, '\\$&');
	var toReplace = new RegExp("(" + wordToHighlight + ")(?!([^<]+)?>)", 'gi');	//g allows for all occurrences to be highlighted and i allows for case insensitivity
	target.innerHTML = original.replace(toReplace, '<mark id="highlight">$&</mark>');
}

function displayValidPanelsInOrder(validPanels, filterWords) {
	//display valid panels
	for (s = 0; s < validPanels.length; s++) {
		matchCounter = 0;	//reset number of matches detected per panel
		panel = validPanels[s];
		panel.style.display = "";	//show valid panels

		//collect total number of words
		heading = panel.getElementsByClassName("panel-heading");    
		headingTextValue = heading[0].textContent; //have to use [0] to access list of one item (header) because of getElements
		headingNumWords = headingTextValue.split(" ").length;
		totalTagNumWords = 0;	//reset number of words from tags
		tags = panel.getElementsByTagName("p"); //check each panel's tags independent of other panels
		for (n = 0; n < tags.length; n++) {
			tag = tags[n];
			tagTextValue = tag.textContent;
			tagNumWords = tagTextValue.split(" ").length;
			totalTagNumWords += tagNumWords;	//add number of words in a tag to total
		}
		totalWords = headingNumWords + totalTagNumWords;	//update total number of words per panel

		//collect total number of matches from heading and tags
		for (q = 0; q < filterWords.length; q++) {
			headingMatch = headingTextValue.toLowerCase().indexOf(filterWords[q].query);   //returns int > -1 to indicate index of where the query was found in the textValueindex
			if (headingMatch > -1) {
				matchCounter += 1;
			}

			for (t = 0; t < tags.length; t++) {
				tag = tags[t];
				tagTextValue = tag.textContent;
				tagMatch = tagTextValue.toLowerCase().indexOf(filterWords[q].query);
				if (tagMatch > -1) {
					matchCounter += 1;
				}
			}
		}
	
		percentMatch = (matchCounter / totalWords * 100);	//calculate percent of words in each panel that matched
		value = percentMatch.toFixed(1) + "%";

		//update progress bar and make visible
		progressBar = panel.getElementsByClassName("progress-bar")[0];
		progressBar.style.display = "";
		progressBar.style.width = value;
		progressBar.textContent = value;
	}	
}

function reorderPanels(validPanels) {
	//determine order of the panels based on the percent match in descending order
	order = validPanels.sort(function(a, b) {
		return b.getElementsByClassName("progress-bar")[0].textContent.replace(/%/, "") - a.getElementsByClassName("progress-bar")[0].textContent.replace(/%/, "");
	});

	//reorder the panels
	for (v = 0; v < validPanels.length; v++) {
		for (j = 0; j < order.length; j++) {
			if (validPanels[v] == order[j]) {
				validPanels[v].style.order = j;
				break;
			} 
		}
	}
}

///////////////////////////
//adding html components
///////////////////////////

function addSearchBar(placeholderText, type) {

	let form = document.createElement("form");
	form.classList.add("form-inline", "d-flex", "justify-content-start", "md-form", "form-sm", "active-cyan-2", "mt-2");

	let input = document.createElement("input");
	input.classList.add("form-control", "w-75");
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", placeholderText);
	input.setAttribute("spellcheck", "true");
	// input.setAttribute("autocorrect", "on");	//can only be used for mobile
	input.setAttribute("id", type);

	let removeButton = document.createElement("button");
	removeButton.classList.add("btn", "btn-danger", "btn-circle");
	removeButton.setAttribute("type", "button");
	removeButton.setAttribute("onclick", "removeSearchBar(this)")

	let icon = document.createElement("i");
	icon.classList.add("glyphicon", "glyphicon-remove");
	removeButton.appendChild(icon);

	form.appendChild(input);
	form.appendChild(removeButton);
	document.getElementById("searches").appendChild(form); 
}

function removeSearchBar(button) {
	button.parentNode.remove();	//remove extra search bars
}

function delayShowAll() {
	toggleLoading();
	setTimeout(function() {	//have to delay or else it will try to run before the loader appears, freezing everything else
		toggleShowAll();
	}, 200);
	setTimeout(function() {	//have to delay or else it resets the display too fast and the loader doesn't seem to appear
		toggleLoading();
	}, 200);
}

function toggleShowAll() {
	allPanels = document.getElementsByClassName("panel");
	if (allPanelsVisible == false) {
		for (i = 0; i < allPanels.length; i++) {
			panel = allPanels[i];
			panel.style.display = "";	//show all
			panel.style.order = "unset";
			progressBar = panel.getElementsByClassName("progress-bar")[0];
			progressBar.style.display = "none";
		}
		allPanelsVisible = true;	//reassign status
		document.getElementById("counter").innerHTML = allPanels.length;	//update counter	
	}
	else {
		for (i = 0; i < allPanels.length; i++) {
			panel = allPanels[i];
			panel.style.display = "none";	//hide all
		}
		allPanelsVisible = false;	//reassign status
		document.getElementById("counter").innerHTML = 0;	//update counter
	}
}

function numberOfResults() {
	document.getElementById("counter").innerHTML = validPanels.length;	//update counter to reflect valid number of panels
}

function main() {
	getData();
}

main();
