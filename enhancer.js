var checkIntervalId = setInterval(check, 1000);

const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
const times = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "21:00", "22:00"];

/**
 * Get the innter text of an element without the inner text of its child
 * elements.
 */
function getTopInnerText(element) {
    var child = element.firstChild;
    var texts = [];

    while (child) {
        if (child.nodeType == 3) {
            texts.push(child.data);
        }
        child = child.nextSibling;
    }

    return texts.join("");
}

function check() {
    // Check if we are on the right page
    var coursesContainer = document.querySelector("#checkin-plocation-accordion-wrapper");
    if(coursesContainer == null) {
        return;
    }
    if(coursesContainer.children.length == 0) {
        return;
    }
    
    // Check if the filter has already been placed
    var filterContainer = document.getElementById("enhancer-nimbuscloud");
    if(filterContainer != null) {
        return;
    }

    setup();
}

function setup() {
    console.log("Setup");
    
    var filterContainer = document.createElement("div");
    filterContainer.id = "enhancer-nimbuscloud";

    var pName = document.createElement("div");
    var inputSearch = document.createElement("input");
    inputSearch.id = "search";
    inputSearch.type = "text";
    inputSearch.placeholder = "Enter course name...";
    inputSearch.addEventListener("input", (evt) => { filter(); });
    pName.appendChild(inputSearch);    
    var buttonClearText = document.createElement("input");
    buttonClearText.type = "button";
    buttonClearText.value = "Clear";
    buttonClearText.addEventListener('click', (evt) => { clearSearchText() });
    pName.appendChild(buttonClearText);
    filterContainer.appendChild(pName);
    
    
    var pDays = document.createElement("div"); 
    pDays.id = "weekdays";
    for (const day of days) {  
        var id = day.toLowerCase();
          
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.addEventListener('change', (evt) => { filter(); });
        pDays.appendChild(input);
        
        var label = document.createElement("label");
        label.htmlFor = id;
        label.innerText = day;
        pDays.appendChild(label);  
    }
    var buttonAllDays = document.createElement("input");
    buttonAllDays.type = "button";
    buttonAllDays.value = "All";
    buttonAllDays.addEventListener('click', (evt) => { setCheckedOfAllDays(true) });
    pDays.appendChild(buttonAllDays);
    
    var buttonNoneDays = document.createElement("input");
    buttonNoneDays.type = "button";
    buttonNoneDays.value = "None";
    buttonNoneDays.addEventListener('click', (evt) => { setCheckedOfAllDays(false) });
    pDays.appendChild(buttonNoneDays);
    
    filterContainer.appendChild(pDays);
    
    
    var pTimes = document.createElement("div");    
    pTimes.id = "timeslots";
    for (const time of times) {
        var id = "t" + time.replace(":", "");
        
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.addEventListener('change', (evt) => { filter() });
        pTimes.appendChild(input);
        
        var label = document.createElement("label");
        label.htmlFor = id;
        label.innerText = time;
        pTimes.appendChild(label);  
    }              
    var buttonAllTimes = document.createElement("input");
    buttonAllTimes.type = "button";
    buttonAllTimes.value = "All";
    buttonAllTimes.addEventListener('click', (evt) => { setCheckedOfAllTimes(true); });
    pTimes.appendChild(buttonAllTimes);
    
    var buttonNoneTimes = document.createElement("input");
    buttonNoneTimes.type = "button";
    buttonNoneTimes.value = "None";
    buttonNoneTimes.addEventListener('click', (evt) => { setCheckedOfAllTimes(false) });
    pTimes.appendChild(buttonNoneTimes);
    
    filterContainer.appendChild(pTimes);
    
    var coursesContainer = document.querySelector("#checkin-plocation-accordion-wrapper");
    coursesContainer.parentElement.insertBefore(filterContainer, coursesContainer); 
}

function clearSearchText() {
    var inputSearch = document.getElementById("search");
    inputSearch.value = "";
    filter();
}

function setCheckedOfAllDays(checked) {
    var boxes = document.querySelectorAll("#weekdays input[type=checkbox]");
    for (const box of boxes) {
        box.checked = checked;
    }
    filter(); 
}

function setCheckedOfAllTimes(checked) {
    var boxes = document.querySelectorAll("#timeslots input[type=checkbox]");
    for (const box of boxes) {
        box.checked = checked;
    }
    filter(); 
}

function filter() {
    console.log("Filter");
    
    var selectedDays = days.filter(function(day) {
        var id = day.toLowerCase();
        return document.querySelector("#" + id).checked;
    });
    var selectedTimes = times.filter(function(time) {
        var id = "t" + time.replace(":", "");
        return document.querySelector("#" + id).checked;
    });
    var searchTexts = document.querySelector("#search").value.replaceAll(/[ \t]+/g, " ").trim().toLowerCase().split(" ");
    
    var dayContainers = document.querySelectorAll("#checkin-plocation-content-1 .card-body>.list-group");
    for (const container of dayContainers) {
        var day = container.querySelector("div").innerText.trim().substring(0, 2).toUpperCase();
        if(selectedDays.length > 0 && selectedDays.includes(day) == false) {
            container.hidden = true;
        } else {
            container.hidden = false;
        }
    }
    
    var courseContainers = document.querySelectorAll("#checkin-plocation-content-1 .pcheckin-course-item");
    for (const container of courseContainers) {
        if(searchTexts.length > 0) {            
            var courseTitleElement = container.querySelector("div.p-1>h5");
            var courseTitle = getTopInnerText(courseTitleElement).trim().toLowerCase();
            var courseTitleParts = courseTitle.split(" ");
            
            var isMatch = true;
            for (const needle of searchTexts) {
                var needleFound = false;
                for (const part of courseTitleParts) {
                    if(part.indexOf(needle) >= 0) {
                        needleFound = true;
                        break;
                    }
                }

                if (!needleFound) {
                    isMatch = false;
                    break;
                }
            }
            if(!isMatch) {
                container.classList.remove("d-flex");
                container.hidden = true;
                continue;
            }
        }
    
        if(selectedDays.length > 0) {
            var courseDay = container.querySelector("div.p-1>div>:nth-child(1)").innerText.trim().substring(0, 2);
            if(selectedDays.includes(courseDay) == false) {
                container.classList.remove("d-flex");
                container.hidden = true;
                continue;
            }
        }
        
        if(selectedTimes.length > 0) {
            var courseTime = container.querySelector("div.p-1>div>:nth-child(2)").innerText.trim().substring(0, 5);
            if(selectedTimes.includes(courseTime) == false) {
                container.classList.remove("d-flex");
                container.hidden = true;
                continue;
            }
        }
        
        container.hidden = false;
        container.classList.add("d-flex");
    }
}
