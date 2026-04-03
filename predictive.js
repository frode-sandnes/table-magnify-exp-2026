"use strict"

// globals
let allProducts;
let categories;
let categoriesMap;
let categoryList = {};

function disableLivePredictiveTable()
    {
    document.getElementById("snippetStyle")?.remove();    
    }


function enableLivePredictiveTable(tableSelector) 
    {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    allProducts = getFirstColumn(table);
    const allCats = allProducts.map(str => str.slice(0, -2));
    categories = [...new Set(allCats)];
    categoriesMap = categories.reduce((accum, item, index) => ({...accum, [item]:index}),{});
    allProducts.forEach((name,index)=> 
        {
        const cat = name.slice(0,-2);
//    console.log(name, cat, index);
        if (!(cat in categoryList))
            {
            categoryList[cat] = [];
            }
        categoryList[cat].push(index);    
        });

    let historyPopup = document.getElementById('table-history-popup');
    if (!historyPopup) {
        historyPopup = document.createElement('div');
        historyPopup.id = 'table-history-popup';
        historyPopup.style.display = 'none';
        document.body.appendChild(historyPopup);
    }

    const style = document.createElement('style');
    style.id = "snippetStyle";
    style.textContent = `
        /* 1. Utheving: Bruker en semitransparent neonfarge som fungerer over alt */
        ${tableSelector} td:hover, ${tableSelector} td:focus { 
            background-color: rgba(255, 0, 255, 0.15) !important; 
            outline: 3px solid #ff00ff !important; 
            outline-offset: -3px;
            z-index: 10;
        }

        /* 2. Bobler: Bruker en "Glassmorphism" stil med hvit tekst for maksimal kontrast */
        ${tableSelector} td:hover::before, ${tableSelector} td:focus::before,
        ${tableSelector} td:hover::after, ${tableSelector} td:focus::after {
            position: absolute;
            background: rgba(20, 20, 20, 0.9); /* Nesten sort for tekst-lesbarhet */
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            z-index: 2000;
            white-space: nowrap;
            border: 1px solid #ff00ff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        ${tableSelector} td:hover::before, ${tableSelector} td:focus::before {
            content: "KOL: " attr(data-col-name);
            top: -35px; left: 50%; transform: translateX(-50%);
        }

        ${tableSelector} td:hover::after, ${tableSelector} td:focus::after {
            content: "RAD: " attr(data-row-name);
            left: -12px; top: 50%; transform: translate(-100%, -50%);
        }

        /* 3. Historikk-vinduet: Mørkt design med magenta detaljer */
        #table-history-popup {
            position: absolute; z-index: 3000; width: 260px;
            background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(8px); /* Gjør den lesbar over kompleks grafikk */
            color: #ffffff; padding: 15px;
            border-radius: 10px; border: 2px solid #ff00ff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            font-family: 'Segoe UI', Roboto, sans-serif;
            pointer-events: none;
        }
        .hist-entry { border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 0; }
        .hist-meta { font-size: 0.75rem; color: yellow; display: block; text-transform: uppercase; }
        .hist-time { color: #00ffcc; font-family: monospace; font-weight: bold; float: right; }
        .hist-val { font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 2px; }
    `;
    document.head.appendChild(style);

    let sessionData = new Map();
    let activeCell = null;
    let startTime = null;
    let liveInterval = null;
    const SHOW_THRESHOLD = 100;

    function startTracking2(cell) {
        activeCell = cell;
        startTime = Date.now();
        liveInterval = setInterval(() => {
            const duration = Date.now() - startTime;
            updateData2(cell, duration);
            if (duration >= SHOW_THRESHOLD) showPopup2(cell);
        }, 100);
    }

    function stopTracking2() {
        clearInterval(liveInterval);
        historyPopup.style.display = 'none';
        activeCell = null;
        startTime = null;
    }

    function updateData2(cell, duration) {
        const row = cell.getAttribute('data-row-name');
        const col = cell.getAttribute('data-col-name');
        const id = row + "|" + col + "|" + cell.textContent.trim();
        sessionData.set(id, {
            val: cell.textContent.trim(),
            row: row,
            col: col,
            category: categoriesMap[row.slice(0,-2)],
            colIndex: cell.cellIndex,
            rowIndex: cell.parentNode.rowIndex,
            duration: duration
        });
    }


    // with category
    function showPopup2(cell) 
        {
        const rect = cell.getBoundingClientRect();
        historyPopup.style.left = (rect.right + window.scrollX + 20) + 'px';
        historyPopup.style.top = (rect.top + window.scrollY - 10) + 'px';
        historyPopup.style.display = 'block';

        // get items in category
        const col = cell.getAttribute('data-col-name');
        const row = cell.getAttribute('data-row-name');
        const colIdx = cell.cellIndex;
        const category = row.slice(0,-2);
        const list = categoryList[category];
        const values = list.map(rowIdx => 
            {
            const currentRow = table.rows[rowIdx + 1];
            const currCell = currentRow.cells[colIdx];
            return {col, row: allProducts[rowIdx], val:currCell.innerText};
            });

        historyPopup.innerHTML = `` + 
            values.map((item, index, array) => `
                <div class="hist-entry">
                    <span class="hist-meta">${conditionalHelper(item,index,array)}</span><span class="hist-time">${(item.duration / 1000).toFixed(1)}s</span>                    
 <span class="hist-val">${item.row}: <b>${item.val.substring(0,18)}</b></span>
                </div>
            `).join('');
        }



    const colHeaders = Array.from(table.querySelectorAll('thead th, tr:first-child th')).map(th => th.textContent.trim());
    table.querySelectorAll('tr').forEach((row) => {
        const firstCell = row.querySelector('th, td');
        if (!firstCell) return;
        const rowName = firstCell.textContent.trim();

        row.querySelectorAll('td').forEach((cell) => {
            if (cell === firstCell && cell.tagName === 'TH') return;
            const colName = colHeaders[cell.cellIndex] || `KOL ${cell.cellIndex + 1}`;
            cell.setAttribute('data-col-name', colName);
            cell.setAttribute('data-row-name', rowName);
            cell.tabIndex = 0;
            cell.addEventListener('mouseenter', () => startTracking2(cell));
            cell.addEventListener('mouseleave', stopTracking2);
            cell.addEventListener('focus', () => startTracking2(cell));
            cell.addEventListener('blur', stopTracking2);
        });
    });
}






/*                    <span class="hist-meta">${item.row}</span><span class="hist-time">${(item.duration / 1000).toFixed(1)}s</span>*/


function conditionalHelper(item,index,array)
    {
    let retStr = /*categories[item.category] + ", " +*/ item.col;
//console.log(index, array);
    if  (index === 0)
        {
        return retStr;  
        }

// problem er at det er forskjellig kategori.
    const a = item.category;
    const b = (array[index - 1]).category;
    if (a !== b)
        {
        return retStr;  
        }
    return "";
    }

function getFirstColumn(table) 
    {
  if (!table) {
    console.error("Table not found");
    return [];
  }

  // Select all first-child td elements within the table body
  const cells = table.querySelectorAll('tbody tr td:first-child');

  // Convert NodeList to an Array and extract the text content
  return Array.from(cells).map(cell => cell.textContent.trim());
}    