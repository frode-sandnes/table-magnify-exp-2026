"use strict"

// globals
const logId = "table-exp2026-v1";
let trialNo = -1; // initializing
window.zoomChanges = [];
// experiments
let trials = ["plain","annotate","crumbs","snippet" /*, "predict"*/];
let tasks = experimentConfig.categories;
// randomize order
trials.sort((a,b) => Math.random() - 0.5);
tasks.sort((a,b) => Math.random() - 0.5);


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
     
    
receive.onmessage = (event) => 
    {
    const payload = event.data;
    log(payload);
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
log({aggregated:{trials,tasks,
    cssWidth: window.screen.width,
    cssHeight:window.screen.height,
    physicalWidth: window.screen.width * window.devicePixelRatio,
    physicalHeight: window.screen.height * window.devicePixelRatio,
    zoomLevel: window.devicePixelRatio * 100
    }});



function setupNext()
    {
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
/*    nextButton.disabled = true;
        Object.assign(nextButton.style, {
    backgroundColor:'#ccc',
        cursor: 'not-allowed'
        });
console.log(nextButton.disabled);    */
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
    modal.addEventListener('click', () => {
        location.reload();
    });

    // 5. Assemble and inject
    modal.appendChild(text);
    document.body.appendChild(modal);
}



function log(inPayload)
    {       
    const {aggregated} = inPayload;
    // marshalling the payload
    const payloadInfo = {sessionID, currentTrial, currentTask, taskRepetition:repetition(), experimentNo: interactionNo(), training:isTraining()};
    const payload = {...payloadInfo, ...aggregated, noZoomOps: window.zoomChanges.length};
    const zoomPayload = {...payloadInfo,zommOps:window.zoomChanges};
    console.log(payload);   
    console.log(zoomPayload)
    // enable actual logging
    submitToForm(logId, payload); 
    submitToForm(logId, zoomPayload); 
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
    const limit = 25000; // quite safe limit
    const estimatedSize = new TextEncoder().encode(JSON.stringify(list)).length;
    const noChunks = Math.ceil(estimatedSize / limit );
    const splitSize = list.length / noChunks;
    const lists = chunkArray(list, splitSize);
//console.error({limit, estimatedSize, noChunks, splitSize, lists});    
    lists.map((arr,i) => 
        {
        const payload = {...info,part:i,of:noChunks,[name]:arr};
//console.error(payload);
        setTimeout(() =>        // spread out in time not to bombard server. 
                {
                submitToForm(id, payload); 
                }, 1000 * i);
        });
    }

let a = Array.from({ length: 1000 }, (_, i) => i + 1);

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
            setup();
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
    console.log("Zoom tracking initialized at:", lastZoom);

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



