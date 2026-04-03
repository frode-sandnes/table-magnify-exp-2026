"use strict"

/**
 * Legger til interaktiv celle-highlight og hoder-bobler på en tabell.
 * @param {string} tableSelector - CSS-selector for tabellen (f.eks. '#minTabell' eller 'table')
 */

function disableTableTooltip()
    {
    document.getElementById("annotateTyle")?.remove();
    }

function enableTableTooltips(tableSelector) 
    {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    // 1. Legg til nødvendig CSS i dokumentet dynamisk
    const style = document.createElement('style');
    style.id = "annotateTyle";
    style.textContent = `
        ${tableSelector} td { position: relative; }
        ${tableSelector} td:hover { background-color: yellow !important; cursor: crosshair; }
        
        /* Boble-styling */
        ${tableSelector} td:hover::before,
        ${tableSelector} td:hover::after {
            position: absolute;
            background: magenta;
            color: yellow;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            white-space: nowrap;
            z-index: 99;
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }

        /* Kolonne-boble (Topp) */
        ${tableSelector} td:hover::before {
            content: attr(data-col-name);
            top: -60px;
            left: 25%;
            transform: translateX(-50%);
        }

        /* Rad-boble (Venstre) */
        ${tableSelector} td:hover::after {
            content: attr(data-row-name);
            left: 15%;
            top: 0px;
            transform: translate(-100%, -50%);
        }
    `;
    document.head.appendChild(style);

    // 2. Finn kolonneoverskrifter
    const colHeaders = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

    // 3. Gå gjennom alle rader i tbody
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        // Vi antar at første celle i raden (enten th eller td) er radens overskrift
        const rowHeaderCell = row.querySelector('th, td');
        const rowName = rowHeaderCell ? rowHeaderCell.textContent.trim() : "Ukjent";

        // Gå gjennom alle dataceller (td) i denne raden
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            // Finn korresponderende kolonnenavn. 
            // Hvis tabellen har en th i starten av raden, må vi kanskje justere indexen.
            const colIndex = cell.cellIndex; 
            const colName = colHeaders[colIndex] || "Ukjent";

            // Sett data-attributter som CSS-en bruker
            cell.setAttribute('data-col-name', colName);
            cell.setAttribute('data-row-name', rowName);
        });
    });
}