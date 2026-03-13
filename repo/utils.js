// Check if on mines page
function isOnMinesPage() {
    return window.location.href.includes('/mines');
}

// Get all mine tiles
function getMineTiles() {
    return document.querySelectorAll('button.mines_minesGameItem__S2ytQ');
}

// Find cashout button
function findCashoutButton() {
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
        if (btn.textContent.includes('End game') || btn.textContent.includes('Cashout')) {
            return btn;
        }
    }
    return null;
}

// Find start button
function findStartButton() {
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
        if (btn.textContent.includes('Start new game')) {
            return btn;
        }
    }
    return null;
}

// Click element safely
function clickElement(element) {
    if (!element) return false;
    element.click();
    return true;
}
