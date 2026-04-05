"use strict"

// globals
// set up broadcast channel
const receive = new BroadcastChannel("controller");
const send = new BroadcastChannel("table");
let state = "";
let categoryTask;
// Global array to store event objects
// Initialize the global array in the window scope
let eventsList = [];
// Initialize the global array in the window scope
let mouseEventsList = [];
let zeroTime = Date.now();

receive.onmessage = (event) => 
    {
    cleanup(state);
    ({state, categoryTask} = event.data);
    setup(state);
    };

function setup(oldState)
    {
    eventsList = []; // Clear list
    mouseEventsList = [];
    zeroTime = Date.now();
    generateTable();
    switch (oldState)
        {
        case "plain": 
            break;
        case "annotate":
            enableTableTooltips('table');
            break;
        case "crumbs":
            trackTableCellAttention(1000);
            break;
        case "snippet":
            enableLiveInteractiveTable("table");
            break;
        case "predict":
            enableLivePredictiveTable("table");
            break;
        }
    }

function cleanup(oldState)
    {
    switch (oldState)
        {
        case "plain": 
            break;
        case "annotate":
            disableTableTooltip();
            break;
        case "crumbs":
            break;
        case "snippet":
            disableLiveInteractiveTable();
            break;
        case "predict":
            enableLivePredictiveTable("table");
            disableLivePredictiveTable();
            break;
        }
    }

// plain
// generateTable();

// annotate
//generateTable();
//enableTableTooltips('table');
//disableTableTooltip();

// breadcrumbs - gaze heatmap
//generateTable();
//trackTableCellAttention(1000);

// snippet
//generateTable();
//enableLiveInteractiveTable("table");
//disableLiveInteractiveTable();


// predictive
//generateTable();
//enableLivePredictiveTable("table");
//disableLivePredictiveTable();

// likert verdi
// showLikertModal()


document.addEventListener('change', (event) => 
    {
    // Check if the element that triggered the event is a radio button
    if (event.target.type === 'radio') 
        {
        const aggregated = analyzeSelection(categoryTask, "price");
        const raw = {scroll: eventsList, 
                     mouseMove: mouseEventsList};
        const payload = {aggregated, raw};
        send.postMessage(payload);
    }
});




// general handling events, leading edge vs trailing edge throttle

// State to track previous percentages
let lastV = null;
let lastH = null;

/**
 * Enhanced Throttle: Ensures the final trailing event is captured
 */
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
};

function addEventHandlers() {
  const handleScroll = () => {
    const vMax = document.documentElement.scrollHeight - window.innerHeight;
    const vCurrent = Math.round(vMax > 0 ? (window.scrollY / vMax) * 100 : 0);

    const hMax = document.documentElement.scrollWidth - window.innerWidth;
    const hCurrent = Math.round(hMax > 0 ? (window.scrollX / hMax) * 100 : 0);

    let t = (Date.now()) - zeroTime;
    // round to seconds with one digit
    t = (t / 1000).toFixed(1);

    if (vCurrent !== lastV) {
      const vEvent = { v: vCurrent, t };
      eventsList.push(vEvent);
 //     console.log("Vertical:", vEvent);
      lastV = vCurrent;
    }

    if (hCurrent !== lastH) {
      const hEvent = { h: hCurrent, t };
      eventsList.push(hEvent);
//      console.log("Horizontal:", hEvent);
      lastH = hCurrent;
    }
  };

  window.addEventListener('scroll', throttle(handleScroll, 100));
}

addEventHandlers();




// mouse events


/**
 * Trailing-edge Throttle
 * Ensures execution at the start and at the very end of a sequence.
 */
const throttleTrailing = (func, limit) => {
  let lastFunc;
  let lastRan;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Sets up the mouse movement event handler
 */
function addMouseHandler() {
  const handleMouseMove = (event) => {

    let t = (Date.now()) - zeroTime;
    // round to seconds with one digit
    t = (t / 1000).toFixed(1);
    // pageX/Y are relative to the document origin
    // Math.floor ensures they are integers
    const mouseEventObj = {
      x: Math.floor(event.pageX),
      y: Math.floor(event.pageY),
      t
    };

    // Push to global list
    mouseEventsList.push(mouseEventObj);

    // Output to console
 //   console.log("Mouse Position Recorded:", mouseEventObj);
  };

  // Attach throttled listener to the document
  document.addEventListener('mousemove', throttleTrailing(handleMouseMove, 100));
}

// Initialize the handler
addMouseHandler();