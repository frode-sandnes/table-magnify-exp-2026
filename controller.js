"use strict"

// globals
const logId = "table-exp2026-v1";
let trialNo = -1; // initializing
window.zoomChanges = [];
// experiments
let tasks = experimentConfig.categories;
// randomize order
// trials.sort((a,b) => Math.random() - 0.5);
tasks.sort((a,b) => Math.random() - 0.5);

    // Latin squares for order
/*const latinSquare = [[0, 1, 2, 3 ],
                    [1, 0, 3, 2],
                    [2, 3, 0, 1],
                    [3, 2, 1, 0]];*/
const latinSquare = [[0, 1, 2 ],
                    [1, 2, 0],
                    [2, 0, 1]];   
// organize the trials
const sourceTrials = ["plain","annotate","crumbs"/*,"snippet" , "predict"*/];
// pull a random goup                    
const participantGroup = Math.floor(Math.random() * latinSquare.length);    
// get the order
const experimentOrder = latinSquare[participantGroup];
//console.log({participantGroup, experimentOrder, sourceTrials})
const trials = experimentOrder.map(i => sourceTrials[i]);

                

/*console.log("loaded...");


document.addEventListener('DOMContentLoaded', () => 
    {
    console.log("starting....");

    });*/

//console.log({participantGroup,experimentOrder, trials})


// set up broadcast channel
const send = new BroadcastChannel("controller");
const receive = new BroadcastChannel("table");

let nextButton;
const sessionID = Date.now();
let currentTrial = "";
let currentTask = "";

/**
 * Creates and injects a button at a specific viewport position.
 * @param {string} label - The text to display on the button.
 */
function createFloatingButton(label, x, y, handler, experiment = "", categoryTask = "") 
    {
    const btn = document.createElement('button');
    
    // Set the text
    btn.innerText = label;

    // Apply Styles for positioning and appearance
    Object.assign(btn.style, {
        position: 'fixed',
        left: x,
        top: y,
        zIndex: '1000',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });
    
/*    Object.assign(btn.style:disabled , {
            background-color: #ccc;
            cursor: not-allowed;
    });*/

    // Attach the click event listener
    btn.addEventListener('click', () => {handler({state:experiment, categoryTask, training:isTraining()})});

    // Add it to the page
    document.body.appendChild(btn);
    return btn;
    }


// Initialize the buttons - for testing
/*createFloatingButton('Plain', "10%", "20%", handleButtonClick, "plain", "usb-cables");
createFloatingButton('Annotation/heatmap', "10%", "30%", handleButtonClick, "annotate", "usb-cables");
createFloatingButton('Crumbs', "10%", "40%", handleButtonClick, "crumbs", "usb-cables");
createFloatingButton('Snippet', "10%", "50%", handleButtonClick, "snippet", "usb-cables");
createFloatingButton('Predictive (experimental)', "10%", "60%", handleButtonClick, "predict", "usb-cables");*/


function disableButton(button, state)
    {
    button.disabled = state;
    const style = state
        ?   {
            backgroundColor:'#ccc',
            cursor: 'not-allowed'
            }
        :   {
            backgroundColor: '#007BFF',
            cursor: 'pointer'
            }
    Object.assign(button.style, style);
    }

// next button
nextButton = createFloatingButton('Next task', "80%", "80%", showLikertModal, "next");
disableButton(nextButton, true);
/*nextButton.disabled = true;
Object.assign(nextButton.style, 
    {
    backgroundColor:'#ccc',
        cursor: 'not-allowed'
    });*/

function handleButtonClick(payload) 
    {
    // send message to the table
    send.postMessage(payload);
    document.getElementById("instructions").innerText = `Task ${trialNo + 1}: Find the cheapest ${payload.categoryTask}! Click on the radio button with the smallest price, then click the next button.`;
    currentTrial = trials[trialNo];
    currentTask = tasks[trialNo];      
    }
     
let receivedPayload;    
receive.onmessage = (event) => 
    {
    receivedPayload = JSON.parse(JSON.stringify(event.data));
//    log(payload); // do it later when finished
    disableButton(nextButton, false);
/*    nextButton.disabled = false;
    Object.assign(nextButton.style, {
        backgroundColor: '#007BFF',
        cursor: 'pointer'
        });*/
    };

    
function recordedLikert(score) 
    {
    log({aggregated:{likertScore:score}})
    setupNext();
    }





function repetition()
    {
    return trialNo % experimentConfig.taskRepetitions;    
    }
function interactionNo()
    {
    return Math.trunc(trialNo / experimentConfig.taskRepetitions);    
    }
function isTraining()
    {
    return repetition() == 0;
    }

// log orders and display info
log({aggregated:{trials,tasks,participantGroup,
    cssWidth: window.screen.width,
    cssHeight:window.screen.height,
    physicalWidth: window.screen.width * window.devicePixelRatio,
    physicalHeight: window.screen.height * window.devicePixelRatio,
    zoomLevel: window.devicePixelRatio * 100
    }});



function setupNext()
    {
    // first log what we have gathered
    if (receivedPayload !== undefined)
        {   // but not the first time we call the page
        log(receivedPayload);     
        }    
    window.zoomChanges = [];    
    trialNo++;
    if (interactionNo() >= trials.length)
        {
        showThankYouModal();
        }
    currentTrial = trials[interactionNo()];
    currentTask = tasks[interactionNo()];  
    send.postMessage({state:currentTrial, categoryTask:currentTask});  
    document.getElementById("instructions").innerText = `Task ${trialNo + 1}: Find the cheapest ${currentTask}! Click on the radio button with the smallest price, then click the next button.`;
    disableButton(nextButton, true);
    }


function showThankYouModal() {
    // 1. Create the modal container
    const modal = document.createElement('div');
    
    // 2. Style the container (Full screen, centered content)
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: "rgb(30 30 30)", // Dark semi-transparent background
        color: 'white',
        display: 'grid',
        placeItems: 'center', // Magic centering!
        zIndex: '9999',
        fontFamily: 'sans-serif',
        cursor: 'pointer' // Clue for the user to click to close
    });

    // 3. Create the text element
    const text = document.createElement('h1');
    text.innerText = 'THANK YOU';
    Object.assign(text.style, {
        fontSize: '5rem',
        margin: '0',
        letterSpacing: '5px',
        textAlign: 'center'
    });

    // 4. Add click-to-close functionality
//    modal.addEventListener('click', () => {
//        location.reload();

    // add comment field
    const comment = document.createElement("textarea");
    const submit = document.createElement("button");
    submit.innerText = "Submit feedback";
    comment.style.width = "80%";
    comment.style.height = "30%";
    submit.onclick = () => 
            { 
            log({aggregated:{comment: comment.value}});
            location.reload();
            };
    Object.assign(submit.style, {
    /*    position: 'fixed',
        left: x,
        top: y,*/
        zIndex: '1000',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });

    // 5. Assemble and inject
    modal.appendChild(text);
    modal.appendChild(comment);
    modal.appendChild(submit);

    document.body.appendChild(modal);
}



function log(inPayload)
    {       
    const {aggregated} = inPayload;
    // marshalling the payload
    const payloadInfo = {sessionID, currentTrial, currentTask, taskRepetition:repetition(), experimentNo: interactionNo(), training:isTraining()};
    const payload = {...payloadInfo, ...aggregated, noZoomOps: window.zoomChanges.length};
//    console.log(payload);   
    // enable actual logging
    submitToForm(logId, payload); 
    // only log zoom operations if there are any
    if (window.zoomChanges.length > 0)
        {
        const zoomPayload = {...payloadInfo,zommOps:window.zoomChanges};
        submitToForm(logId, zoomPayload); 
//        console.log(zoomPayload)
        }

    if ("raw" in inPayload)
        {
        const {raw} = inPayload;
        const {scroll, mouseMove} = raw;
        saveLargeArrayToForm("table-exp2026-v1", payloadInfo, "scroll", scroll);
        saveLargeArrayToForm("table-exp2026-v1", payloadInfo, "mouseMove", mouseMove);
   /*     console.error("raw size:", new TextEncoder().encode(JSON.stringify(raw)).length);
        console.error(raw);
        const rawPayload = {...payloadInfo,raw:raw};
        try
            {
//        submitToForm("table-exp2026-v1", rawPayload);
            }
        catch (error) 
            {
            console.error("Problem saving raw:", error.message);
            }*/
        }
    }

// to use later    
function saveLargeArrayToForm(id, info, name, list)
    {
    const limit = 2000; // quite safe limit
//    const limit = 25000; // quite safe limit
    const estimatedSize = new TextEncoder().encode(JSON.stringify(list)).length;
    const noChunks = Math.ceil(estimatedSize / limit );
    const splitSize = list.length / noChunks;
    const lists = chunkArray(list, splitSize);
//console.error({limit, estimatedSize, noChunks, splitSize, lists});    
    lists.map((arr,i) => 
        {
        const payload = {...info,part:i,of:noChunks,[name]:arr};
        addToQueue(payload);
//console.error(payload);
  /*      setTimeout(() =>        // spread out in time not to bombard server. 
                {
                submitToForm(id, payload); 
                console.log("raw ",i);
                console.log(payload);
                }, 3000 * (i + 1));*/
        });
    }



// 1. The Global Queue
const globalQueue = [];
let isProcessing = false;

function addToQueue(element) {
    // Add element to the end of the array
    globalQueue.push(element);
//    console.log(`Added to queue. Current size: ${globalQueue.length}`);

    // Start the processor if it isn't already running
    startProcessor();
}

function startProcessor() 
    {
    if (isProcessing) return; // Prevent multiple intervals
    isProcessing = true;

    const intervalId = setInterval(() => {
        if (globalQueue.length > 0) {
            // 2. Remove the first element (FIFO - First In, First Out)
            const currentElement = globalQueue.shift();
            
            // 3. Process the element
            process(currentElement);
        } else {
            // Optional: Stop interval if queue is empty to save resources
            clearInterval(intervalId);
            isProcessing = false;
//            console.log("Queue empty. Processor paused.");
        }
    }, 1000); // 1000ms = 1 second
}

function process(item) 
    {
    submitToForm(logId, item); 
//    console.log("Processing element:", item);
    }

//let a = Array.from({ length: 1000 }, (_, i) => i + 1);

/*const str = "A".repeat(3000);
console.log(str);
//console.log(chunkArray(a,5))
//saveLargeArrayToForm("bongo", {}, "testing",a)
    submitToForm(logId, str); 
*/

/**
 * Splits an array into smaller arrays of a specified size.
 * @param {Array} array - The original array to be split.
 * @param {number} size - The maximum size of each chunk.
 * @returns {Array[]} - An array containing the chunked arrays.
 */
function chunkArray(array, size) {
  const chunked = [];
  let index = 0;

  while (index < array.length) {
    // .slice(start, end) extracts elements without modifying the original array
    chunked.push(array.slice(index, index + size));
    index += size;
  }

  return chunked;
}



/**
 * Creates and displays a full-screen modal with instructions.
 * When 'Start' is clicked, the modal is removed and setup() is called.
 */
function createInstructionModal() {
    // 1. Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'instruction-modal';
    
    // Inline styles for full-screen coverage
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: "rgb(30 30 30)", // Dark background
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '20px'
    });

    // 2. Create the content wrapper
    const content = document.createElement('div');
    content.style.maxWidth = '600px';

    // 3. Add your instructions
    const title = document.createElement('h1');
    title.innerText = "Instructions";
    
    const instructions = document.createElement('p');
    instructions.innerText = "Thank your agreeing to participate in this experiment. Participation is voluntary and you can withdraw from the experiment at any time. No personal information is recorded and you will remain anonymous. Task completion times, error rates and your opinions will be recorded. Please contact us if you want to receive updates about the results of the experiment.";
    
    instructions.style.lineHeight = '1.6';
    instructions.style.marginBottom = '30px';
    instructions.style.textAlign = "left";

    // 4. Create the 'Start' button
    const startBtn = document.createElement('button');
    startBtn.innerText = "Start";
    Object.assign(startBtn.style, {
        padding: '15px 40px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.2s'
    });

    // Button Hover Effects
    startBtn.onmouseover = () => startBtn.style.backgroundColor = '#0056b3';
    startBtn.onmouseout = () => startBtn.style.backgroundColor = '#007bff';

    // 5. Logic: Close modal and trigger setup
    startBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (typeof setup === "function") {
            showDemographicsModal(logDemographic);
 //           setup();
        } else {
            console.warn("setup() function is not defined.");
        }
    };

    // Assemble and inject into the DOM
    content.appendChild(title);
    content.appendChild(instructions);
    content.appendChild(startBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

/**
 * The function called after the modal is closed
 */
function setup() {
    console.log("Setup initiated!");
    // Your initialization logic goes here (e.g., starting a timer, spawning elements)
    setupNext();

}

// Call the function to display the modal
createInstructionModal();



// zoom logging
function addZoomEventHandlers() {
    // 1. Helper function to get the most accurate current zoom
    const getZoomLevel = () => {
        // visualViewport.scale handles pinch-zoom
        // devicePixelRatio handles Ctrl +/- zoom
        const vScale = window.visualViewport ? window.visualViewport.scale : 1;
        const dPixelRatio = window.devicePixelRatio || 1;
        
        // We multiply them because some browsers scale both simultaneously
        return vScale * dPixelRatio;
    };

    let lastZoom = getZoomLevel();
//    console.log("Zoom tracking initialized at:", lastZoom);

    // 2. The Poller: Checks for changes every 200ms
    // This is often more reliable than 'resize' events which browsers sometimes suppress
    setInterval(() => {
        const currentZoom = getZoomLevel();

        if (Math.abs(currentZoom - lastZoom) > 0.01) { // 0.01 threshold to avoid float noise
            const change = currentZoom - lastZoom;
            
            // Push the change value to the global array
            window.zoomChanges.push(change);
            // Output the change object to the console as requested
//            console.log({ z: change });
            lastZoom = currentZoom;
        }
    }, 1000); // poll every second - not too often.
}

// Start the poller
addZoomEventHandlers();



// demographic dialoge



function showDemographicsModal(callback) {
  const modalOverlay = document.createElement('div');
  Object.assign(modalOverlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: '1000', fontFamily: 'sans-serif'
  });

  const modalBox = document.createElement('div');
  Object.assign(modalBox.style, {
    backgroundColor: '#fff', padding: '2rem', borderRadius: '8px',
    width: '90%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  });

  modalBox.innerHTML = `
    <h2 style="margin-top: 0;">Participant Info</h2>
    
    <div style="margin-bottom: 1.5rem;">
      <label style="display: block; margin-bottom: 0.5rem;">Gender Identity:</label>
      <select id="genderSelect" style="width: 100%; padding: 8px;">
        <option value="" disabled selected>-- Select Gender --</option>
        <option value="Woman">Woman</option>
        <option value="Man">Man</option>
        <option value="Non-binary">Non-binary</option>
        <option value="Prefer not to disclose">Prefer not to disclose</option>
      </select>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <label style="display: block; margin-bottom: 0.5rem;">Age Range:</label>
      <select id="ageSelect" style="width: 100%; padding: 8px;">
        <option value="" disabled selected>-- Select Age --</option>
        <option value="10-19">10-19</option>
        <option value="20-29">20-29</option>
        <option value="30-39">30-39</option>
        <option value="40-49">40-49</option>
        <option value="50-59">50-59</option>
        <option value="60-69">60-69</option>
        <option value="70-79">70-79</option>
        <option value="Prefer not to disclose">Prefer not to disclose</option>
      </select>
    </div>

    <button id="submitBtn" disabled style="
      width: 100%; padding: 10px; background: #cccccc; color: #666666; 
      border: none; border-radius: 4px; cursor: not-allowed; font-weight: bold;">
      Submit
    </button>
  `;

  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  const genderSelect = document.getElementById('genderSelect');
  const ageSelect = document.getElementById('ageSelect');
  const submitBtn = document.getElementById('submitBtn');

  // Logic to enable/disable button
  const validate = () => {
    if (genderSelect.value && ageSelect.value) {
      submitBtn.disabled = false;
      submitBtn.style.background = '#007bff';
      submitBtn.style.color = 'white';
      submitBtn.style.cursor = 'pointer';
    } else {
      submitBtn.disabled = true;
      submitBtn.style.background = '#cccccc';
      submitBtn.style.color = '#666666';
      submitBtn.style.cursor = 'not-allowed';
    }
  };

  // Listen for changes on both selects
  genderSelect.addEventListener('change', validate);
  ageSelect.addEventListener('change', validate);

  submitBtn.addEventListener('click', () => {
    const results = {aggregated:{
      gender: genderSelect.value,
      age: ageSelect.value
    }};
    document.body.removeChild(modalOverlay);
    if (typeof callback === 'function') callback(results);
  });
}


function logDemographic(demographics)
    {
    log(demographics);
    setup();
    }



         