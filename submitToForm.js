"use strict"

const formURL = /* put your Google forms URL here */;
const postfixURL = `&submit=Submit`;

// id is the unique identifer for the payload type, json is the object to send
function submitToForm(id, json)
    {
     // 1. generate json object
     let payload = {id, payload: json};

    // 2. Convert the JSON object to a string.
    const jsonString = JSON.stringify(payload);
  
    // 3. Encode the string to make it safe for a URL query parameter.
    const encodedPayload = encodeURIComponent(jsonString);

    // 4. submit the result via hidden iframe
    let iframe = document.createElement("iframe");
    iframe.src = `${formURL}${encodedPayload}${postfixURL}`;
    iframe.style = "display:none;";
    document.body.appendChild(iframe);    
    setTimeout(()=>
        {
        iframe.remove();    
        }, 3000);
    }

