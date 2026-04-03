"use strict"

// globals
// set up broadcast channel
const receive = new BroadcastChannel("controller");
const send = new BroadcastChannel("table");
let state = "";
let categoryTask;

receive.onmessage = (event) => 
    {
    cleanup(state);
    ({state, categoryTask} = event.data);
    setup(state);
    };

function setup(oldState)
    {
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
        const payload = analyzeSelection(categoryTask, "price");
        send.postMessage(payload);
    }
});
