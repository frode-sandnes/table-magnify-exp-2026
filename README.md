# Accessible tables for magnifier user - companion resources

This is the companion resources to the paper:

> Frode Eika Sandness, Nusrat Akter, I. Scott MacKenzie: Improving the Accessibility of Web Tables for Magnifier Users with Annotations and Crumbs. In: ICCHP 2026, Computers Helping People with Special Needs, 20th International Conference, LNCS, Springer, In press (2026).

The paper explores two visual embellishments for making tables more accessible to magnifier users.

## Trying the magnification embellishments

A live demo of the experimental platform can be found here:
https://frode-sandnes.github.io/table-magnify-exp-2026/

You can create bookmarks to the following bookmarklets and apply the techniques on any website.
- [Annotate](javascript:(function(){function enableTableTooltips(tableSelector){const table=document.querySelector(tableSelector);if(!table)return;const style=document.createElement('style');style.className="annotateStyle";style.textContent=`${tableSelector} td { position: relative; } ${tableSelector} td:hover { background-color: yellow !important; cursor: crosshair; } ${tableSelector} td:hover::before, ${tableSelector} td:hover::after { position: absolute; background: magenta; color: yellow; padding: 4px 8px; border-radius: 4px; font-size: 16px; font-weight: bold; white-space: nowrap; z-index: 99; pointer-events: none; box-shadow: 0 2px 5px rgba(0,0,0,0.5); } ${tableSelector} td:hover::before { content: attr(data-col-name); top: -60px; left: 25%; transform: translateX(-50%); } ${tableSelector} td:hover::after { content: attr(data-row-name); left: 15%; top: 0px; transform: translate(-100%, -50%); }`;document.head.appendChild(style);const colHeaders=Array.from(table.querySelectorAll('thead th')).map(th=>th.textContent.trim());const rows=table.querySelectorAll('tbody tr');rows.forEach(row=>{const rowHeaderCell=row.querySelector('th, td');const rowName=rowHeaderCell?rowHeaderCell.textContent.trim():"Ukjent";const cells=row.querySelectorAll('td');cells.forEach((cell)=>{const colIndex=cell.cellIndex;const colName=colHeaders[colIndex]||"Ukjent";cell.setAttribute('data-col-name',colName);cell.setAttribute('data-row-name',rowName);});});}document.querySelectorAll('table').forEach((tbl,idx)=>{if(!tbl.id){tbl.id='table-tool-id-'+idx;}enableTableTooltips('#'+tbl.id);});})();): The highlighted cell is annotated with the corresponding column and row header.
- [Crumbs](bookmarklet-crumbs): The visited cells are highlighted, as well as the corresponding row and column, leaving a breadcrumbs trail along the path of the viewed table.
- [Snippet](bookmarklet-snippet): A popup shows recently visited cells for quick reference (discussed by not included in the experiment as the concept need more work).

You may experiment by combining the bookmarklets to get the benefits of each.

It is assumed that the tables take the following format: First row and column contain header information. Each row contains a separate item and the columns contain corresponding attributes of each item.

Note that these are simply prototype demonstrations. They use fixed colors for simplicity which may render too low contrast with particular web site designs. 

The code has only been tested with Chrome.

## Brief overview of the code components
The embellishments:
- [annotateTooltip.js](annotateTooltip.js)
- [breadcrumbs.js](breadcrumbs.js)
- [snippet.js](snippet.js)

Experiment framework
- [experimentConfig.js](experimentConfig.js): most of the experiment configuration parameters
- [randomTable.js](randomTable.js): generating random tables
- [tableController.js](tableController.js): table logic for detecting table interactions
- [likertModal.js](likertModal.js): Likert question mobal logic
- [submitToForm.js](submitToForm.js): Logging logic.
- [index.html](index.html): Main page
- [page.html](page.html): The iFrame showing the table (inside the "keyhole")

