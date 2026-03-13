window.highlightedTiles = [];

// Helper to check if tile is already opened/revealed
function isTileRevealed(tile) {
    return tile.disabled || 
           tile.getAttribute('disabled') !== null ||
           tile.classList.contains('mines_minesGameItemWin__4kRNF');
}

// Helper to check if tile is a bomb
function isTileBomb(tile) {
    return tile.classList.contains('mines_minesGameItemOtherMine__cOPla');
}

// Start watching for bombs to clear highlights
function watchForBombs() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if any bomb elements were added or changed
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const bombTiles = document.querySelectorAll('.mines_minesGameItemOtherMine__cOPla');
                if (bombTiles.length > 0 && window.highlightedTiles.length > 0) {
                    // A bomb exploded, clear all highlights
                    window.clearHighlights();
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
    
    return observer;
}

// Start bomb watcher when script loads
let bombObserver = null;
if (!bombObserver) {
    bombObserver = watchForBombs();
}

// Update method options based on category
window.updateMethodOptions = function(category) {
    const methodSelect = document.getElementById('prediction-method');
    if (!methodSelect) return;
    
    methodSelect.innerHTML = '';
    
    const methods = {
        'random': [
            { value: 'random-1', text: 'Random 1 Tile' },
            { value: 'random-3', text: 'Random 3 Tiles' },
            { value: 'random-5', text: 'Random 5 Tiles' }
        ],
        'corner': [
            { value: 'corner-four', text: 'Four Corners' },
            { value: 'corner-opposite', text: 'Opposite Corners' },
            { value: 'corner-single', text: 'Single Corner' }
        ],
        'pattern': [
            { value: 'pattern-checker', text: 'Checkerboard' },
            { value: 'pattern-diagonal', text: 'Diagonal' },
            { value: 'pattern-spiral', text: 'Spiral' },
            { value: 'pattern-zigzag', text: 'Zigzag' }
        ],
        'probability': [
            { value: 'prob-center', text: 'Center Focus' },
            { value: 'prob-edges', text: 'Edge Strategy' },
            { value: 'prob-quadrants', text: 'Quadrant' },
            { value: 'prob-safe-zone', text: 'Safe Zone' }
        ],
        'risk': [
            { value: 'risk-low', text: 'Low Risk' },
            { value: 'risk-medium', text: 'Medium Risk' },
            { value: 'risk-high', text: 'High Risk' },
            { value: 'risk-martingale', text: 'Martingale' }
        ],
        'historical': [
            { value: 'hist-common', text: 'Common' },
            { value: 'hist-recent', text: 'Recent' },
            { value: 'hist-winning', text: 'Winning' }
        ],
        'advanced': [
            { value: 'adv-ml', text: 'ML Simulation' },
            { value: 'adv-statistical', text: 'Statistical' },
            { value: 'adv-predictive', text: 'Predictive' }
        ]
    };
    
    if (methods[category]) {
        methods[category].forEach(method => {
            const option = document.createElement('option');
            option.value = method.value;
            option.textContent = method.text;
            methodSelect.appendChild(option);
        });
    }
};

// Clear all highlights
window.clearHighlights = function() {
    window.highlightedTiles.forEach(tile => {
        if (tile && tile.style) {
            tile.style.outline = '';
            tile.style.boxShadow = '';
        }
    });
    window.highlightedTiles = [];
};

// Main prediction function
window.highlightTiles = function(method, minesCount, gridSize) {
    const startButton = document.querySelector('button.button_button__dZRSb.button_primary__LXFHi.gameBetSubmit');
    if (startButton && (startButton.textContent.includes('Start new game') || startButton.textContent.includes('Play'))) {
        if (typeof window.MinesRoundNotStarted === 'function') {
            window.MinesRoundNotStarted();
        }
        return;
    }
    
    window.clearHighlights();

    const tiles = getMineTiles();
    if (tiles.length === 0) return;

    let [rows, cols] = gridSize.toLowerCase().split('x').map(Number);
    if (!rows || !cols || rows < 5 || rows > 10 || cols < 5 || cols > 10) {
        rows = 5;
        cols = 5;
    }

    const totalTiles = rows * cols;
    let patternPredictions = [];
    
    // Get pattern-based predictions
    if (method === 'random-1') {
        while (patternPredictions.length < 1) {
            const r = Math.floor(Math.random() * totalTiles);
            if (!patternPredictions.includes(r)) patternPredictions.push(r);
        }
    } else if (method === 'random-3') {
        while (patternPredictions.length < 3) {
            const r = Math.floor(Math.random() * totalTiles);
            if (!patternPredictions.includes(r)) patternPredictions.push(r);
        }
    } else if (method === 'random-5') {
        while (patternPredictions.length < 5) {
            const r = Math.floor(Math.random() * totalTiles);
            if (!patternPredictions.includes(r)) patternPredictions.push(r);
        }
    } else if (method === 'corner-four') {
        patternPredictions = [0, cols-1, (rows-1)*cols, (rows*cols)-1];
    } else if (method === 'corner-opposite') {
        patternPredictions = [0, (rows*cols)-1];
    } else if (method === 'corner-single') {
        const corners = [0, cols-1, (rows-1)*cols, (rows*cols)-1];
        patternPredictions = [corners[Math.floor(Math.random() * corners.length)]];
    } else if (method === 'pattern-checker') {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if ((i + j) % 2 === 0) patternPredictions.push(i * cols + j);
            }
        }
    } else if (method === 'pattern-diagonal') {
        for (let i = 0; i < Math.min(rows, cols); i++) {
            patternPredictions.push(i * cols + i);
            const anti = i * cols + (cols - 1 - i);
            if (!patternPredictions.includes(anti)) patternPredictions.push(anti);
        }
    } else if (method === 'pattern-spiral') {
        const center = Math.floor(rows/2) * cols + Math.floor(cols/2);
        patternPredictions = [center, center-cols, center+cols, center-1, center+1];
    } else if (method === 'pattern-zigzag') {
        for (let i = 0; i < rows; i++) {
            if (i % 2 === 0) {
                for (let j = 0; j < Math.min(2, cols); j++) patternPredictions.push(i * cols + j);
            } else {
                for (let j = Math.max(0, cols-2); j < cols; j++) patternPredictions.push(i * cols + j);
            }
        }
    } else if (method === 'prob-center') {
        const c = Math.floor(rows/2) * cols + Math.floor(cols/2);
        patternPredictions = [c, c-cols, c+cols, c-1, c+1].filter(i => i >= 0 && i < totalTiles);
    } else if (method === 'prob-edges') {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i === 0 || i === rows-1 || j === 0 || j === cols-1) {
                    patternPredictions.push(i * cols + j);
                }
            }
        }
    } else if (method === 'prob-quadrants') {
        patternPredictions = [0, cols-1, (rows-1)*cols, (rows*cols)-1];
    } else if (method === 'prob-safe-zone') {
        patternPredictions = [3 * cols + 1];
    } else if (method === 'risk-low') {
        for (let i = 0; i < Math.min(3, totalTiles); i++) patternPredictions.push(i);
    } else if (method === 'risk-medium') {
        for (let i = 0; i < Math.min(5, totalTiles); i++) patternPredictions.push(i);
    } else if (method === 'risk-high') {
        for (let i = 0; i < Math.min(8, totalTiles); i++) patternPredictions.push(i);
    } else if (method === 'risk-martingale') {
        for (let i = 0; i < totalTiles; i += Math.floor(totalTiles/6)) patternPredictions.push(i);
    } else if (method === 'hist-common') {
        for (let i = 0; i < totalTiles; i += Math.floor(totalTiles/7)) patternPredictions.push(i);
    } else if (method === 'hist-recent') {
        for (let i = Math.floor(totalTiles*0.3); i < Math.floor(totalTiles*0.7); i += 2) patternPredictions.push(i);
    } else if (method === 'hist-winning') {
        for (let i = Math.floor(totalTiles*0.4); i < Math.floor(totalTiles*0.4)+5; i++) patternPredictions.push(i);
    } else if (method === 'adv-ml') {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if ((i + j) % 3 === 0) patternPredictions.push(i * cols + j);
            }
        }
    } else if (method === 'adv-statistical') {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i === 0 || i === rows-1 || j === 0 || j === cols-1) patternPredictions.push(i * cols + j);
            }
        }
    } else if (method === 'adv-predictive') {
        for (let i = 1; i < rows-1; i++) {
            for (let j = 1; j < cols-1; j++) patternPredictions.push(i * cols + j);
        }
    }

    // Remove duplicates
    patternPredictions = [...new Set(patternPredictions)].filter(i => i >= 0 && i < totalTiles);

    // Get valid pattern predictions (not revealed)
    const validPatternPredictions = [];
    const closedIndices = [];
    
    // Find all closed tiles
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] && !isTileRevealed(tiles[i])) {
            closedIndices.push(i);
        }
    }
    
    // Filter pattern predictions to only include closed tiles
    for (let i = 0; i < patternPredictions.length; i++) {
        const index = patternPredictions[i];
        if (tiles[index] && !isTileRevealed(tiles[index])) {
            validPatternPredictions.push(index);
        }
    }

    // Determine target count based on method
    let targetCount = 5;
    if (method === 'random-1') targetCount = 1;
    else if (method === 'random-3') targetCount = 3;
    else if (method === 'corner-single') targetCount = 1;
    else if (method === 'corner-opposite') targetCount = 2;
    else if (method === 'corner-four') targetCount = 4;
    
    // Start with valid pattern predictions
    const finalPredictions = [...validPatternPredictions];
    
    // Fill with random closed tiles if needed
    if (finalPredictions.length < targetCount && closedIndices.length > 0) {
        const remainingClosed = closedIndices.filter(idx => !finalPredictions.includes(idx));
        
        // Shuffle
        for (let i = remainingClosed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingClosed[i], remainingClosed[j]] = [remainingClosed[j], remainingClosed[i]];
        }
        
        // Add random tiles until target count
        for (let i = 0; i < remainingClosed.length && finalPredictions.length < targetCount; i++) {
            finalPredictions.push(remainingClosed[i]);
        }
    }
    
    // Limit to target count
    while (finalPredictions.length > targetCount) {
        finalPredictions.pop();
    }

    // Highlight final predictions
    finalPredictions.forEach(index => {
        if (tiles[index]) {
            tiles[index].style.outline = '3px solid #48d19d';
            tiles[index].style.boxShadow = '0 0 15px rgba(72, 209, 157, 0.5)';
            window.highlightedTiles.push(tiles[index]);
        }
    });

    // Update display
    const displayEl = document.getElementById('current-method');
    if (displayEl) {
        displayEl.textContent = `Current: ${method} (${rows}x${cols})`;
    }
};
