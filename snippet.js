"use strict"

function disableLiveInteractiveTable()
    {
    document.getElementById("snippetStyle")?.remove();    
    }

function enableLiveInteractiveTable(tableSelector) 
    {
    const table = document.querySelector(tableSelector);
 if (!table) return;

    const cellDurations = new Map();
    let activeCell = null;
    let entryTime = null;
    let hoverTimer = null;
    let hideTimer = null;

    const popup = document.createElement('div');
    popup.id = "snippetStyle";
    Object.assign(popup.style, {
        position: 'fixed',
        display: 'none',
        backgroundColor: 'white',
        border: '1px solid #222',
        padding: '12px',
        zIndex: '10000',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        maxHeight: '450px',
        overflowY: 'auto',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
        fontSize: '13px',
        minWidth: '240px',
        borderRadius: '6px'
    });
    document.body.appendChild(popup);

    // Interaction Bridge
    popup.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popup.addEventListener('mouseleave', () => popup.style.display = 'none');

    table.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;
        
        clearTimeout(hideTimer);

        if (cell !== activeCell) {
            recordDuration();
            activeCell = cell;
            entryTime = Date.now();
        }

        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
            showTopEngagementPopup(e.clientX, e.clientY);
        }, 100);
    });

    table.addEventListener('mouseout', () => {
        hideTimer = setTimeout(() => popup.style.display = 'none', 250);
        clearTimeout(hoverTimer);
    });

    function recordDuration() {
        if (activeCell && entryTime) {
            const elapsed = Date.now() - entryTime;
            cellDurations.set(activeCell, (cellDurations.get(activeCell) || 0) + elapsed);
            entryTime = Date.now(); 
        }
    }

    function showTopEngagementPopup(mouseX, mouseY) {
        recordDuration(); 

        const topEntries = Array.from(cellDurations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7);

        if (topEntries.length === 0) return;

        // Group, Sort by group size, then Sort internally by row index
        const sortedGroups = getSortedGroups(topEntries.map(e => e[0]));
        renderContent(sortedGroups);

        popup.style.display = 'block';
        const pRect = popup.getBoundingClientRect();
        
        // Positioning logic (15px offset to prevent flickering)
        let x = mouseX + 15; 
        let y = mouseY + 15; 

        if (x + pRect.width > window.innerWidth) x = mouseX - pRect.width - 15;
        if (y + pRect.height > window.innerHeight) y = mouseY - pRect.height - 15;

        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
    }

    function getSortedGroups(cells) {
        const groups = {};
        
        cells.forEach(cell => {
            const colIdx = cell.cellIndex;
            const row = cell.parentElement;
            const colHeader = table.querySelector(`thead th:nth-child(${colIdx + 1})`)?.innerText || `Col ${colIdx}`;
            const firstColVal = row.cells[0]?.innerText || "N/A";

            if (!groups[colHeader]) groups[colHeader] = [];
            groups[colHeader].push({
                element: cell,
                rowIdx: row.rowIndex,
                rowLabel: firstColVal,
                val: cell.innerText
            });
        });

        // 1. Internal Sort each group by Row Number
        for (let key in groups) {
            groups[key].sort((a, b) => a.rowIdx - b.rowIdx);
        }

        // 2. Transform to Array and Sort Groups by Size (Descending)
        return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    }

    function renderContent(sortedGroups) {
        popup.innerHTML = '<div style="font-weight:bold; color:#444; border-bottom:2px solid #eee; margin-bottom:8px; padding-bottom:4px;">Frequent Columns</div>';
        
        sortedGroups.forEach(([colName, items]) => {
            const container = document.createElement('div');
            container.style.marginBottom = '12px';

            const header = document.createElement('div');
            header.style.cssText = 'background:#f8f9fa; font-weight:bold; padding:4px 8px; border-left:3px solid #007bff;';
            header.innerText = colName;
            container.appendChild(header);

            items.forEach(item => {
                const rowItem = document.createElement('div');
                rowItem.style.cssText = 'cursor:pointer; padding:5px 10px; border-bottom:1px solid #f0f0f0;';
                // Pattern: [First Column Value] [Current Cell Value]
                rowItem.innerHTML = `<span style="color:#555;">${item.rowLabel}:</span> <span style="font-weight:600;">${item.val}</span>`;
                
                rowItem.onmouseenter = () => rowItem.style.backgroundColor = '#f1f8ff';
                rowItem.onmouseleave = () => rowItem.style.backgroundColor = 'transparent';
                
                rowItem.onclick = (e) => {
                    e.stopPropagation();
                    // Navigate
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Enable Radio
                    const radio = item.element.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // Highlight effect
                    item.element.animate([
                        { backgroundColor: "#fff3cd" },
                        { backgroundColor: "transparent" }
                    ], { duration: 2000 });
                };
                
                container.appendChild(rowItem);
            });
            popup.appendChild(container);
        });
    }
}
