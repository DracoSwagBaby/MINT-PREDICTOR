// towers-predictor.js - Complete Towers Prediction System
(function() {
    'use strict';
    
    
    // ============================================
    // STATE
    // ============================================
    let towersHighlightedTiles = [];
    let towersAutoPlayEnabled = false;
    let towersAutoCashoutEnabled = false;
    let towersAutoStartEnabled = false;
    let towersAutoPlayInterval = null;
    let towersAutoStartInterval = null;
    let currentTowerIndex = 0;
    let lastGameState = null;
    let gameStateInterval = null;
    
    // ============================================
    // FIND ELEMENTS
    // ============================================
    function getTowerRows() {
        return document.querySelectorAll('.towers_towersGameRow__flu2C');
    }
    
    function getTowerButtons() {
        return document.querySelectorAll('button.towers_towersGameButton__xLe_v');
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
    
    // ============================================
    // GAME STATE DETECTION - CLEAR HIGHLIGHTS WHEN GAME ENDS
    // ============================================
    function checkGameState() {
        // Look for End game button (means game is active)
        const endGameBtn = document.querySelector('button.button_button__dZRSb.button_secondary__Fa_lP.gameBetSubmit');
        const gameActive = endGameBtn && endGameBtn.textContent.includes('End game');
        
        // If game was active but now it's not, round ended
        if (lastGameState === true && gameActive === false && towersHighlightedTiles.length > 0) {
            clearTowerHighlights();
        }
        
        lastGameState = gameActive;
    }
    
    // ============================================
    // HIGHLIGHT FUNCTIONS
    // ============================================
    function clearTowerHighlights() {
        towersHighlightedTiles.forEach(tile => {
            if (tile && tile.style) {
                tile.style.outline = '';
                tile.style.boxShadow = '';
            }
        });
        towersHighlightedTiles = [];
        currentTowerIndex = 0;
        
        // Flash clear button to indicate clearance
        const clearBtn = document.getElementById('towers-clear-btn');
        if (clearBtn) {
            clearBtn.style.background = '#1a4d3e';
            setTimeout(() => {
                clearBtn.style.background = '';
            }, 200);
        }
    }
    
    function highlightTowerButton(button) {
        if (!button) return;
        button.style.outline = '3px solid #48d19d';
        button.style.boxShadow = '0 0 15px rgba(72, 209, 157, 0.5)';
        towersHighlightedTiles.push(button);
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function getTotalRows() {
        const d = document.getElementById('towers-difficulty')?.value || 'easy';
        return d === 'easy' ? 8 : d === 'normal' ? 10 : 12;
    }
    
    // ============================================
    // AUTO PLAY FUNCTIONS - BOTTOM TO TOP
    // ============================================
    function towersClickCurrentTile() {
        if (currentTowerIndex < towersHighlightedTiles.length) {
            const tile = towersHighlightedTiles[currentTowerIndex];
            if (tile && document.body.contains(tile)) {
                tile.click();
                currentTowerIndex++;
                
                // Check if all rows clicked
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
    
    // ============================================
    // AUTO CASHOUT
    // ============================================
    function towersToggleAutoCashout() {
        const btn = document.getElementById('towers-autocashout-btn');
        if (!btn) return;
        
        towersAutoCashoutEnabled = !towersAutoCashoutEnabled;
        btn.textContent = towersAutoCashoutEnabled ? 'AUTO CASHOUT: ON' : 'AUTO CASHOUT: OFF';
        btn.classList.toggle('active', towersAutoCashoutEnabled);
    }
    
    // ============================================
    // AUTO START
    // ============================================
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
    
    // ============================================
    // PREDICTION METHODS
    // ============================================
    function predictTowers() {
        clearTowerHighlights();
        
        const method = document.getElementById('towers-method')?.value || 'same-column';
        const totalRows = getTotalRows();
        const rows = getTowerRows();
        
        if (rows.length === 0) {
            return;
        }
        
        
        const startRow = Math.max(0, rows.length - totalRows);
        let bottomToTopTiles = [];
        
        // RANDOM METHODS - Pick random rows and random columns
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
                
                if (btn) {
                    bottomToTopTiles.push(btn);
                }
            });
        }
        else if (method === 'random-3') {
            const indices = new Set();
            while (indices.size < 3) {
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
                
                if (btn) {
                    bottomToTopTiles.push(btn);
                }
            });
        }
        else if (method === 'random-5') {
            const indices = new Set();
            while (indices.size < 5) {
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
                
                if (btn) {
                    bottomToTopTiles.push(btn);
                }
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
                
                if (btn) {
                    bottomToTopTiles.push(btn);
                }
            });
        }
        // OTHER METHODS
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
        
        // Highlight all tiles in bottom-to-top order
        bottomToTopTiles.forEach(btn => highlightTowerButton(btn));
        towersHighlightedTiles = bottomToTopTiles;
        
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Check game state every second
        if (!gameStateInterval) {
            gameStateInterval = setInterval(checkGameState, 1000);
        }
    }
    
    // ============================================
    // EXPOSE FUNCTIONS GLOBALLY
    // ============================================
    window.predictTowers = predictTowers;
    window.clearTowerHighlights = clearTowerHighlights;
    window.towersToggleAutoPlay = towersToggleAutoPlay;
    window.towersToggleAutoCashout = towersToggleAutoCashout;
    window.towersToggleAutoStart = towersToggleAutoStart;
    window.towersHighlightedTiles = towersHighlightedTiles;
    
    // Initialize
    init();
    
})();
