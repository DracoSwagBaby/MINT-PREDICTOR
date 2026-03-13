window.autoPlayEnabled = false;
window.autoCashoutEnabled = false;
window.autoStartEnabled = false;
let autoPlayInterval = null;
let autoStartInterval = null;
let tilesClicked = 0;
let currentGameTiles = 0;

window.clickCashout = function() {
    const btn = findCashoutButton();
    if (btn && !btn.disabled) {
        btn.click();
        tilesClicked = 0;
        currentGameTiles = 0;
        return true;
    }
    return false;
};

window.clickTile = function(tile) {
    if (!tile) return false;
    
    if (tilesClicked === 0) {
        currentGameTiles = window.highlightedTiles.length;
    }
    
    tile.click();
    tilesClicked++;
    
    if (window.autoCashoutEnabled && tilesClicked === currentGameTiles && currentGameTiles > 0) {
        setTimeout(() => window.clickCashout(), 100);
    }
    
    return true;
};

window.startAutoPlay = function() {
    if (autoPlayInterval) return;
    
    window.autoPlayEnabled = true;
    tilesClicked = 0;
    currentGameTiles = window.highlightedTiles.length;
    
    let index = 0;
    autoPlayInterval = setInterval(() => {
        if (!window.autoPlayEnabled) {
            window.stopAutoPlay();
            return;
        }
        
        if (window.highlightedTiles.length === 0) return;
        
        if (index < window.highlightedTiles.length) {
            const tile = window.highlightedTiles[index];
            if (tile && document.body.contains(tile)) {
                window.clickTile(tile);
            }
            index++;
        } else {
            index = 0;
        }
    }, 500);
};

window.stopAutoPlay = function() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    window.autoPlayEnabled = false;
};

window.toggleAutoPlay = function() {
    window.autoPlayEnabled = !window.autoPlayEnabled;
    if (window.autoPlayEnabled) {
        if (window.highlightedTiles.length > 0) {
            window.startAutoPlay();
        } else {
            window.autoPlayEnabled = false;
            alert('Run prediction first');
        }
    } else {
        window.stopAutoPlay();
    }
};

window.startAutoStart = function() {
    if (autoStartInterval) return;
    window.autoStartEnabled = true;
    
    autoStartInterval = setInterval(() => {
        if (!window.autoStartEnabled) {
            window.stopAutoStart();
            return;
        }
        const btn = findStartButton();
        if (btn && !btn.disabled) {
            btn.click();
            tilesClicked = 0;
            currentGameTiles = window.highlightedTiles.length;
        }
    }, 1000);
};

window.stopAutoStart = function() {
    if (autoStartInterval) {
        clearInterval(autoStartInterval);
        autoStartInterval = null;
    }
    window.autoStartEnabled = false;
};

window.toggleAutoStart = function() {
    window.autoStartEnabled = !window.autoStartEnabled;
    window.autoStartEnabled ? window.startAutoStart() : window.stopAutoStart();
};

window.toggleAutoCashout = function() {
    window.autoCashoutEnabled = !window.autoCashoutEnabled;
};
