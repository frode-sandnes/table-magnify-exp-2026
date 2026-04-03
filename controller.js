"use strict"

// globals
// set up broadcast channel
const send = new BroadcastChannel("controller");
const receive = new BroadcastChannel("table");
let nextButton;
const sessionID = Date.now();
let currentTrial = "";
let currentTask = "";

console.log(sessionID)

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
    btn.addEventListener('click', () => {handler({state:experiment, categoryTask})});

    // Add it to the page
    document.body.appendChild(btn);
    return btn;
    }


// Initialize the buttons
createFloatingButton('Plain', "10%", "20%", handleButtonClick, "plain", "usb-cables");
createFloatingButton('Annotation/heatmap', "10%", "30%", handleButtonClick, "annotate", "usb-cables");
createFloatingButton('Crumbs', "10%", "40%", handleButtonClick, "crumbs", "usb-cables");
createFloatingButton('Snippet', "10%", "50%", handleButtonClick, "snippet", "usb-cables");
createFloatingButton('Predictive (experimental)', "10%", "60%", handleButtonClick, "predict", "usb-cables");

// next button
nextButton = createFloatingButton('Next task', "80%", "80%", showLikertModal, "next");
nextButton.disabled = true;
Object.assign(nextButton.style, 
    {
    backgroundColor:'#ccc',
        cursor: 'not-allowed'
    });

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
    nextButton.disabled = false;
    Object.assign(nextButton.style, {
        backgroundColor: '#007BFF',
        cursor: 'pointer'
        });
    };

function recordedLikert(score) 
    {
    log({likertScore:score})
    setupNext();
    }


// experiments
let trials = ["plain","annoate","crumbs","snippet" /*, "predict"*/];
let tasks = experimentConfig.categories;
// randomize order
trials.sort((a,b) => Math.random() - 0.5);
tasks.sort((a,b) => Math.random() - 0.5);
let trialNo = 0; // initializing

// log orders
log({trials,tasks});


function setupNext()
    {
    trialNo++;
    if (trialNo >= trials.length)
        {
        showThankYouModal();
        }
    currentTrial = trials[trialNo];
    currentTask = tasks[trialNo];  
    send.postMessage({state:currentTrial, categoryTask:currentTask});  
    document.getElementById("instructions").innerText = `Task ${trialNo + 1}: Find the cheapest ${currentTask}! Click on the radio button with the smallest price, then click the next button.`;
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark semi-transparent background
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
        document.body.removeChild(modal);
    });

    // 5. Assemble and inject
    modal.appendChild(text);
    document.body.appendChild(modal);
}



function log(pack)
    {
    // marshalling the payload
    let payload = {sessionID, currentTrial, currentTask, ...pack};
//    console.log(payload);   
    // enable actual logging
    submitToForm("table-exp2026-v1", payload); 
    }