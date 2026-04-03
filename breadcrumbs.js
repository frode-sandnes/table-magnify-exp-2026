"use strict"

const holdDelay = 500;

function trackTableCellAttention(delay) {
    const table = document.querySelector('table');
    if (!table) return;

    let hoverTimer;
    let intensityInterval;

    table.addEventListener('mouseover', (e) => {
        // Target only standard data cells, ignoring table headers (th)
        const cell = e.target.closest('td');
        if (!cell) return;

        // 1. Wait for the initial delay (continuous hover)
        hoverTimer = setTimeout(() => {
            markAsVisited(cell);
            tintNeighbors(cell);

            // 2. Increase intensity by 10% for every additional second
            intensityInterval = setInterval(() => {
                increaseIntensity(cell);
            }, delay);

        }, holdDelay);
    });

    table.addEventListener('mouseout', (e) => {
        // Clear all timers as soon as the cursor leaves the cell
        clearTimeout(hoverTimer);
        clearInterval(intensityInterval);
    });

    function markAsVisited(cell) {
        if (!cell.dataset.visited) {
            cell.dataset.visited = "true";
            cell.dataset.intensity = "10"; // Starting at 10%
            updateYellowFill(cell);
        }
    }

    function increaseIntensity(cell) {
        let current = parseInt(cell.dataset.intensity || 0);
        if (current < 100) {
            current = Math.min(current + 10, 100);
            cell.dataset.intensity = current;
            updateYellowFill(cell);
        }
    }

    function updateYellowFill(cell) {
        const intensity = cell.dataset.intensity;
        // HSL 60 is Yellow. Lightness 100% is white, 50% is pure yellow.
        // We map 10-100% intensity to 95% down to 50% lightness.
        const lightness = 100 - (intensity / 2);
        cell.style.backgroundColor = `hsl(60, 100%, ${lightness}%)`;
    }

    function tintNeighbors(cell) {
        const rowIndex = cell.parentElement.rowIndex;
        const colIndex = cell.cellIndex;
        const rows = table.rows;

        // Tint Row (Red for non-visited <td> only)
        Array.from(rows[rowIndex].cells).forEach(c => {
            if (c.tagName === 'TD' && !c.dataset.visited && c !== cell) {
                c.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            }
        });

        // Tint Column (Green for non-visited <td> only)
        Array.from(rows).forEach(r => {
            const c = r.cells[colIndex];
            if (c && c.tagName === 'TD' && !c.dataset.visited && c !== cell) {
                c.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            }
        });
    }
}