function setupEventHandlers() {
    // ========== MINES PANEL ==========
    document.getElementById('predict-btn')?.addEventListener('click', () => {
        const count = document.getElementById('mines-count')?.value || 3;
        const size = document.getElementById('grid-size')?.value || '5x5';
        const method = document.getElementById('prediction-method')?.value;
        window.highlightTiles(method, count, size);
    });

    document.getElementById('autoplay-btn')?.addEventListener('click', function() {
        window.toggleAutoPlay();
        this.textContent = window.autoPlayEnabled ? 'AUTO PLAY: ON' : 'AUTO PLAY: OFF';
        this.classList.toggle('active', window.autoPlayEnabled);
    });

    document.getElementById('autocashout-btn')?.addEventListener('click', function() {
        window.toggleAutoCashout();
        this.textContent = window.autoCashoutEnabled ? 'AUTO CASHOUT: ON' : 'AUTO CASHOUT: OFF';
        this.classList.toggle('active', window.autoCashoutEnabled);
    });

    document.getElementById('autostart-btn')?.addEventListener('click', function() {
        window.toggleAutoStart();
        this.textContent = window.autoStartEnabled ? 'AUTO START: ON' : 'AUTO START: OFF';
        this.classList.toggle('active', window.autoStartEnabled);
    });

    document.getElementById('clear-btn')?.addEventListener('click', () => {
        window.clearHighlights();
    });

    // ========== TOWERS PANEL ==========
document.getElementById('towers-predict-btn')?.addEventListener('click', () => {
    if (typeof window.predictTowers === 'function') {
        window.predictTowers();
    }
});

document.getElementById('towers-autoplay-btn')?.addEventListener('click', function() {
    if (typeof window.towersToggleAutoPlay === 'function') {
        window.towersToggleAutoPlay();
    }
});

document.getElementById('towers-autocashout-btn')?.addEventListener('click', function() {
    if (typeof window.towersToggleAutoCashout === 'function') {
        window.towersToggleAutoCashout();
    }
});

document.getElementById('towers-autostart-btn')?.addEventListener('click', function() {
    if (typeof window.towersToggleAutoStart === 'function') {
        window.towersToggleAutoStart();
    }
});

document.getElementById('towers-clear-btn')?.addEventListener('click', () => {
    if (typeof window.clearTowerHighlights === 'function') {
        window.clearTowerHighlights();
    }
});

// Difficulty change - clear highlights
document.getElementById('towers-difficulty')?.addEventListener('change', () => {
    if (typeof window.clearTowerHighlights === 'function') {
        window.clearTowerHighlights();
    }
});

// Method change - clear highlights
document.getElementById('towers-method')?.addEventListener('change', () => {
    if (typeof window.clearTowerHighlights === 'function') {
        window.clearTowerHighlights();
    }
});

// Bet amount validation
document.getElementById('towers-bet')?.addEventListener('input', function(e) {
    const val = parseFloat(e.target.value);
    e.target.style.borderColor = val >= 25 ? '#48d19d' : '#ff6b6b';
});

    // Blackjack AI toggle
    document.getElementById('blackjack-ai-selfplay')?.addEventListener('click', function() {
        if (typeof window.blackjackToggleAISelfPlay === 'function') {
        window.blackjackToggleAISelfPlay();
        } else {
        if (typeof window.toggleAISelfPlay === 'function') {
            window.toggleAISelfPlay();
        }
        }
    });

    // Category selector for Mines - MAKE SURE THIS IS INSIDE setupEventHandlers
    document.querySelectorAll('#category-selector .mintflip-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('#category-selector .mintflip-category-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the method dropdown based on category
            if (typeof window.updateMethodOptions === 'function') {
                window.updateMethodOptions(this.dataset.category);
            } else {
            }
        });
    });

    // Input validation
    document.getElementById('grid-size')?.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase();
        if (val.match(/^\d+x\d+$/)) {
            const [x, y] = val.split('x').map(Number);
            e.target.style.borderColor = (x >= 5 && x <= 10 && y >= 5 && y <= 10 && x === y) 
                ? '#48d19d' : '#ff6b6b';
        } else {
            e.target.style.borderColor = '#1a4d3e';
        }
    });

    document.getElementById('mines-count')?.addEventListener('input', function(e) {
        const val = parseInt(e.target.value);
        e.target.style.borderColor = (val >= 1 && val <= 24) ? '#48d19d' : '#ff6b6b';
    });
}

// ============================================
// TOWERS AUTO PLAY FUNCTIONS - BOTTOM TO TOP
// ============================================
let towersHighlightedTiles = [];
let towersAutoPlayEnabled = false;
let towersAutoCashoutEnabled = false;
let towersAutoStartEnabled = false;
let towersAutoPlayInterval = null;
let towersAutoStartInterval = null;
let currentTowerIndex = 0;

function getTowerRows() {
    return document.querySelectorAll('.towers_towersGameRow__flu2C');
}

function findTowersCashoutButton() {
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
        if (btn.textContent.includes('End game') || btn.textContent.includes('Cashout')) {
            return btn;
        }
    }
    return null;
}

function findTowersStartButton() {
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
        if (btn.textContent.includes('Start new game')) {
            return btn;
        }
    }
    return null;
}

function clearTowerHighlights() {
    towersHighlightedTiles.forEach(tile => {
        if (tile && tile.style) {
            tile.style.outline = '';
            tile.style.boxShadow = '';
        }
    });
    towersHighlightedTiles = [];
    currentTowerIndex = 0;
}

function highlightTowerButton(button) {
    if (!button) return;
    button.style.outline = '3px solid #48d19d';
    button.style.boxShadow = '0 0 15px rgba(72, 209, 157, 0.5)';
    towersHighlightedTiles.push(button);
}

function towersClickCurrentTile() {
    if (currentTowerIndex < towersHighlightedTiles.length) {
        const tile = towersHighlightedTiles[currentTowerIndex];
        if (tile && document.body.contains(tile)) {
            tile.click();
            currentTowerIndex++;
            
            if (currentTowerIndex >= towersHighlightedTiles.length && towersAutoCashoutEnabled) {
                setTimeout(() => {
                    const cashoutBtn = findTowersCashoutButton();
                    if (cashoutBtn && !cashoutBtn.disabled) {
                        cashoutBtn.click();
                    }
                }, 100);
            }
        }
    }
}

function towersStartAutoPlay() {
    if (towersAutoPlayInterval) return;
    if (towersHighlightedTiles.length === 0) {
        alert('Run prediction first');
        return;
    }
    
    towersAutoPlayEnabled = true;
    currentTowerIndex = 0;
    
    towersAutoPlayInterval = setInterval(() => {
        if (!towersAutoPlayEnabled) {
            towersStopAutoPlay();
            return;
        }
        towersClickCurrentTile();
    }, 800);
}

function towersStopAutoPlay() {
    if (towersAutoPlayInterval) {
        clearInterval(towersAutoPlayInterval);
        towersAutoPlayInterval = null;
    }
    towersAutoPlayEnabled = false;
}

function towersToggleAutoPlay() {
    const btn = document.getElementById('towers-autoplay-btn');
    if (!btn) return;
    
    towersAutoPlayEnabled = !towersAutoPlayEnabled;
    
    if (towersAutoPlayEnabled) {
        towersStartAutoPlay();
        btn.textContent = 'AUTO PLAY: ON';
        btn.classList.add('active');
    } else {
        towersStopAutoPlay();
        btn.textContent = 'AUTO PLAY: OFF';
        btn.classList.remove('active');
    }
}

function towersToggleAutoCashout() {
    const btn = document.getElementById('towers-autocashout-btn');
    if (!btn) return;
    
    towersAutoCashoutEnabled = !towersAutoCashoutEnabled;
    btn.textContent = towersAutoCashoutEnabled ? 'AUTO CASHOUT: ON' : 'AUTO CASHOUT: OFF';
    btn.classList.toggle('active', towersAutoCashoutEnabled);
}

function towersStartAutoStart() {
    if (towersAutoStartInterval) return;
    
    towersAutoStartEnabled = true;
    
    towersAutoStartInterval = setInterval(() => {
        if (!towersAutoStartEnabled) {
            towersStopAutoStart();
            return;
        }
        
        const startBtn = findTowersStartButton();
        if (startBtn && !startBtn.disabled) {
            startBtn.click();
            currentTowerIndex = 0;
        }
    }, 1000);
}

function towersStopAutoStart() {
    if (towersAutoStartInterval) {
        clearInterval(towersAutoStartInterval);
        towersAutoStartInterval = null;
    }
    towersAutoStartEnabled = false;
}

function towersToggleAutoStart() {
    const btn = document.getElementById('towers-autostart-btn');
    if (!btn) return;
    
    towersAutoStartEnabled = !towersAutoStartEnabled;
    
    if (towersAutoStartEnabled) {
        towersStartAutoStart();
        btn.textContent = 'AUTO START: ON';
        btn.classList.add('active');
    } else {
        towersStopAutoStart();
        btn.textContent = 'AUTO START: OFF';
        btn.classList.remove('active');
    }
}

function getTotalRows() {
    const d = document.getElementById('towers-difficulty')?.value || 'easy';
    return d === 'easy' ? 8 : d === 'normal' ? 10 : 12;
}

// Main prediction function
function predictTowers() {
    clearTowerHighlights();
    
    const method = document.getElementById('towers-method')?.value || 'same-column';
    const totalRows = getTotalRows();
    const rows = getTowerRows();
    
    if (rows.length === 0) return;
    
    const startRow = Math.max(0, rows.length - totalRows);
    let bottomToTopTiles = [];
    
    // Random methods
    if (method === 'random-any') {
        const rowsToPick = Math.floor(Math.random() * totalRows) + 1;
        const pickedIndices = new Set();
        
        while (pickedIndices.size < rowsToPick) {
            pickedIndices.add(Math.floor(Math.random() * totalRows));
        }
        
        const sortedIndices = Array.from(pickedIndices).sort((a, b) => b - a);
        
        sortedIndices.forEach((rowOffset) => {
            const row = rows[startRow + rowOffset];
            if (!row) return;
            
            const containers = row.querySelectorAll('.towers_towersGameRowContainer__HCJog');
            if (containers.length === 0) return;
            
            const randomCol = Math.floor(Math.random() * containers.length);
            const btn = containers[randomCol]?.querySelector('button');
            
            if (btn) bottomToTopTiles.push(btn);
        });
    }
    else if (method === 'random-3') {
        const indices = new Set();
        while (indices.size < 3) indices.add(Math.floor(Math.random() * totalRows));
        const sortedIndices = Array.from(indices).sort((a, b) => b - a);
        
        sortedIndices.forEach((rowOffset) => {
            const row = rows[startRow + rowOffset];
            if (!row) return;
            const containers = row.querySelectorAll('.towers_towersGameRowContainer__HCJog');
            if (containers.length === 0) return;
            const randomCol = Math.floor(Math.random() * containers.length);
            const btn = containers[randomCol]?.querySelector('button');
            if (btn) bottomToTopTiles.push(btn);
        });
    }
    else if (method === 'random-5') {
        const indices = new Set();
        while (indices.size < 5) indices.add(Math.floor(Math.random() * totalRows));
        const sortedIndices = Array.from(indices).sort((a, b) => b - a);
        
        sortedIndices.forEach((rowOffset) => {
            const row = rows[startRow + rowOffset];
            if (!row) return;
            const containers = row.querySelectorAll('.towers_towersGameRowContainer__HCJog');
            if (containers.length === 0) return;
            const randomCol = Math.floor(Math.random() * containers.length);
            const btn = containers[randomCol]?.querySelector('button');
            if (btn) bottomToTopTiles.push(btn);
        });
    }
    else if (method === 'random-8') {
        const indices = new Set();
        while (indices.size < 8 && indices.size < totalRows) {
            indices.add(Math.floor(Math.random() * totalRows));
        }
        const sortedIndices = Array.from(indices).sort((a, b) => b - a);
        
        sortedIndices.forEach((rowOffset) => {
            const row = rows[startRow + rowOffset];
            if (!row) return;
            const containers = row.querySelectorAll('.towers_towersGameRowContainer__HCJog');
            if (containers.length === 0) return;
            const randomCol = Math.floor(Math.random() * containers.length);
            const btn = containers[randomCol]?.querySelector('button');
            if (btn) bottomToTopTiles.push(btn);
        });
    }
    // Other methods
    else {
        for (let i = totalRows - 1; i >= 0; i--) {
            const row = rows[startRow + i];
            if (!row) continue;
            
            const containers = row.querySelectorAll('.towers_towersGameRowContainer__HCJog');
            if (containers.length === 0) continue;
            
            let col = 1;
            
            switch(method) {
                case 'same-column': col = 1; break;
                case 'zigzag': col = (totalRows - 1 - i) % 3; break;
                case 'highest-value':
                    let highest = 0, idx = 0;
                    containers.forEach((c, n) => {
                        const val = c.querySelector('span.text_text__fMaR4')?.textContent;
                        if (val && parseFloat(val) > highest) {
                            highest = parseFloat(val);
                            idx = n;
                        }
                    });
                    col = idx;
                    break;
                case 'alternating': col = (totalRows - 1 - i) % 2; break;
                case 'middle-column': col = 1; break;
                case 'edges': col = (totalRows - 1 - i) % 2 === 0 ? 0 : 2; break;
                case 'progressive': col = (totalRows - 1 - i) % 3; break;
                case 'safe-zone': 
                    if (i >= totalRows - 3) col = 1;
                    else col = Math.floor(Math.random() * 3);
                    break;
                case 'martingale': 
                    if (i >= totalRows - 2) col = 0;
                    else if (i >= totalRows - 4) col = 1;
                    else col = 2;
                    break;
                default: col = 1;
            }
            
            if (col >= containers.length) col = containers.length - 1;
            
            const btn = containers[col]?.querySelector('button');
            if (btn) bottomToTopTiles.push(btn);
        }
    }
    
    bottomToTopTiles.forEach(btn => highlightTowerButton(btn));
    towersHighlightedTiles = bottomToTopTiles;
    
}

// Expose functions globally
window.predictTowers = predictTowers;
window.clearTowerHighlights = clearTowerHighlights;
window.towersToggleAutoPlay = towersToggleAutoPlay;
window.towersToggleAutoCashout = towersToggleAutoCashout;
window.towersToggleAutoStart = towersToggleAutoStart;
