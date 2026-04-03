   "use strict"
   
// globals
let shuffledProducts;
let tbody;
let finalHeaders;
let startTime = new Date();

function generateTable()
    {
    startTime = performance.now();
    // 0. remove previous table if it is there
    document.getElementById("experimentTable")?.remove();

   // 1. Configuration & Data Generation
   const categories = experimentConfig.categories;
   const attributes = experimentConfig.attributes;

    const allProducts = [];
    categories.forEach(cat => {
        for (let i = 1; i <= experimentConfig.productsPerCategory; i++) {
            allProducts.push({
                name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Pro ${i}`,
                category: cat,
                color: ['Obsidian', 'Arctic', 'Crimson', 'Cobalt'][Math.floor(Math.random() * 4)],
                size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
                weight: (Math.random() * 10).toFixed(2),
                rating: (Math.random() * 5).toFixed(1),
                warranty: Math.floor(Math.random() * 5) + 1,
                price: Math.floor(Math.random() * 1000) + 10,
                'battery capacity': Math.floor(Math.random() * 5000) + 500,
                'cable length': (Math.random() * 3).toFixed(1),
                Compatibility: 'Universal',
                Material: 'Alloy',
                'SKU Number': 'SKU-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                'Warehouse Location': 'Bay-' + Math.floor(Math.random() * 50),
                'Stock Level': Math.floor(Math.random() * 100),
                'Supplier Name': 'TechCorp',
                'product number': Math.floor(Math.random() * 90000) + 10000
            });
        }
    });

    // 2. Randomization logic
  shuffledProducts = [...allProducts].sort(() => Math.random() - 0.5);
    const shuffledCols = [...attributes].sort(() => Math.random() - 0.5);
    finalHeaders = ['product name', ...shuffledCols];

    // 3. Table Construction (Direct child of body)
    const table = document.createElement('table');
    table.id = "experimentTable";
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    finalHeaders.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    tbody = document.createElement('tbody');
    shuffledProducts.forEach((prod, rowIndex) => {
        const tr = document.createElement('tr');
        // Store metadata on row for easier access
        tr.dataset.category = prod.category;
        tr.dataset.originalIndex = rowIndex; 

        finalHeaders.forEach(col => {
            const td = document.createElement('td');
            const radio = document.createElement('input');
            radio.type = 'radio';
            // "only one radio button in the table can be selected at any time"
            radio.name = 'table-master-select'; 
            
            // Meta-tags for the function to read
            radio.dataset.colName = col;
            radio.dataset.catName = prod.category;
            radio.dataset.val = (col === 'product name') ? prod.name : prod[col];

            td.appendChild(radio);
            td.appendChild(document.createTextNode(" " + radio.dataset.val));
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    document.body.appendChild(table);
    }


    /**
     * Analysis function per requirements
     * @param {string} targetCat - The category name to match
     * @param {string} targetCol - The column name to match
     */
    function analyzeSelection(targetCat, targetCol) {
        const selected = document.querySelector('input[name="table-master-select"]:checked');
        if (!selected) return null;

        const selectedCat = selected.dataset.catName;
        const selectedCol = selected.dataset.colName;
        const selectedVal = parseFloat(selected.dataset.val);

        // Calculate if smallest in category for the given targetCol
        const catItems = shuffledProducts.filter(p => p.category === targetCat);
        const valuesInCat = catItems.map(p => parseFloat(p[targetCol])).filter(v => !isNaN(v));
        const minVal = Math.min(...valuesInCat);
        
        // Find indices of the requested category rows as rendered in table
        const categoryRowIndices = [];
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach((r, idx) => {
            if (r.dataset.category === targetCat) categoryRowIndices.push(idx);
        });

        return {
            categoryMatch: selectedCat === targetCat,
            columnMatch: selectedCol === targetCol,
            isSmallestInCategory: !isNaN(selectedVal) && selectedVal === minVal,
            columnParameterIndex: finalHeaders.indexOf(targetCol),
            categoryRowIndices: categoryRowIndices,
            taskTime: performance.now() - startTime
        };
    };
