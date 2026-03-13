// ==UserScript==
// @name         Mint-FLIP Predictor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Mines, Towers & Blackjack Predictor
// @author       d_ra.co_alt
// @match        https://bloxgame.com/*
// @match        https://www.bloxgame.com/*
// @grant        none
// @run-at       document-end
// @require      config.js
// @require      utils.js
// @require      prediction-methods.js
// @require      ui-core.js
// @require      ui-tabs.js
// @require      auto-features.js
// @require      dragging.js
// @require      blackjack-predictor.js
// @require      event-handlers.js
// ==/UserScript==

(function() {
    'use strict';

// ============================================
// UID-BASED SESSION TIMER WITH COOLDOWN (WORKS EVERYWHERE)
// ============================================
const SESSION_TIME = 45 * 60 * 1000; // 45 minutes
const COOLDOWN_TIME = 12 * 60 * 60 * 1000; // 12 hours


// ============================================
// ALLOWLIST CHECK - UNLIMITED ACCESS FOR SPECIFIC UIDS
// ============================================
async function checkAllowlist(uid) {
    try {
        // Add timestamp to bypass cache
        const url = `https://api.npoint.io/311a9ae96ea56dadd341?t=${Date.now()}`;
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache' }
        });
        const text = await response.text();
        
        const allowlist = JSON.parse(text);
        
        return allowlist.includes(uid);
    } catch (error) {
        return false;
    }
}

// Store UID globally once we get it
let cachedUID = null;

// Get UID - first from cache, then from DOM
function getUserUID() {
    // Return cached UID if we have it
    if (cachedUID) return cachedUID;
    
    // Try to get from DOM
    const uidElement = document.querySelector('.Profile_userUID__Qj38P');
    if (uidElement) {
        cachedUID = uidElement.textContent.trim();
        return cachedUID;
    }
    
    // Try to get from localStorage (previous session)
    const storedUID = localStorage.getItem('mintflip_cached_uid');
    if (storedUID) {
        cachedUID = storedUID;
        return cachedUID;
    }
    
    return null;
}

// Save UID to cache and localStorage
function saveUID(uid) {
    cachedUID = uid;
    localStorage.setItem('mintflip_cached_uid', uid);
}

// Wait for UID element to exist (only needed once)
function waitForUID(callback) {
    // Check if we already have UID in cache
    const cached = getUserUID();
    if (cached) {
        callback(cached);
        return;
    }
    
    // Otherwise wait for it on profile page
    const observer = new MutationObserver(() => {
        const uid = getUserUID();
        if (uid) {
            observer.disconnect();
            saveUID(uid);
            callback(uid);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
        observer.disconnect();
        callback('anonymous');
    }, 10000);
}

// Check session based on UID
async function checkSession() {
    const uid = getUserUID() || 'anonymous';


    // 🟢 WHITELIST CHECK - THIS MUST BE FIRST
    const isAllowed = await checkAllowlist(uid);
    if (isAllowed) {
        // Create a special session for whitelisted users that never expires
        const storageKey = `mintflip_session_${uid}`;
        const whitelistSession = {
            status: 'whitelist',
            startTime: Date.now(),
            endTime: Infinity, // Never expires
            uid: uid
        };
        localStorage.setItem(storageKey, JSON.stringify(whitelistSession));
        return true;
    }
    
    // 🔴 NORMAL USER - Regular 45 minute timer
    const storageKey = `mintflip_session_${uid}`;
    const sessionData = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const now = Date.now();
    
    if (sessionData) {
        // Check if in cooldown
        if (sessionData.status === 'cooldown') {
            const timeInCooldown = now - sessionData.endTime;
            if (timeInCooldown < COOLDOWN_TIME) {
                // Still in cooldown
                const totalSecondsLeft = Math.floor((COOLDOWN_TIME - timeInCooldown) / 1000);
                const hoursLeft = Math.floor(totalSecondsLeft / 3600);
                const minutesLeft = Math.floor((totalSecondsLeft % 3600) / 60);
                const secondsLeft = totalSecondsLeft % 60;
                showCooldownMessage(hoursLeft, minutesLeft, secondsLeft);
                return false;
            } else {
                // Cooldown over, start new session
                const newSession = {
                    status: 'active',
                    startTime: now,
                    endTime: now + SESSION_TIME,
                    uid: uid
                };
                localStorage.setItem(storageKey, JSON.stringify(newSession));
                return true;
            }
        }
        
        // If session was active
        if (sessionData.status === 'active') {
            const timeLeft = sessionData.endTime - now;
            
            if (timeLeft <= 0) {
                // Session expired, move to cooldown
                const cooldownSession = {
                    status: 'cooldown',
                    endTime: now,
                    uid: uid
                };
                localStorage.setItem(storageKey, JSON.stringify(cooldownSession));
                showExpiredMessage();
                return false;
            } else {
                // Session still active
                return true;
            }
        }
    }
    
    // First time user - start new session
    const newSession = {
        status: 'active',
        startTime: now,
        endTime: now + SESSION_TIME,
        uid: uid
    };
    localStorage.setItem(storageKey, JSON.stringify(newSession));
    return true;
}
// Get remaining time for current UID
function getRemainingTime() {
    const uid = getUserUID() || 'anonymous';
    
    const storageKey = `mintflip_session_${uid}`;
    const sessionData = JSON.parse(localStorage.getItem(storageKey) || 'null');
    
    if (sessionData) {
        // Whitelisted users get INFINITE time
        if (sessionData.status === 'whitelist') {
            return Infinity; // Special value for infinite time
        }
        
        if (sessionData.status === 'active') {
            const now = Date.now();
            const timeLeft = sessionData.endTime - now;
            return Math.max(0, timeLeft);
        }
    }
    
    return 0;
}

function startHeaderTimer() {
    function updateTimer() {
        const timerEl = document.getElementById('mintflip-header-timer');
        if (!timerEl) return;
        
        const timeLeft = getRemainingTime();
        
        // Check for infinite time (whitelisted)
        if (timeLeft === Infinity) {
            timerEl.textContent = '∞ INF';
            timerEl.style.background = '#0f2f24';
            timerEl.style.color = '#ffd700';
            timerEl.style.borderColor = '#ffd700';
            return; // Stop here, don't process further
        }
        
        if (timeLeft <= 0) {
            timerEl.textContent = '00:00';
            timerEl.style.background = '#2f1a1a';
            timerEl.style.color = '#ff6b6b';
            timerEl.style.borderColor = '#ff6b6b';
            
            // Close the UI
            const container = document.querySelector('.mintflip-container');
            const overlay = document.querySelector('.mintflip-overlay');
            if (container) container.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
            return;
        }
        
        // Format time (MM:SS) for normal users
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when less than 5 minutes
        if (timeLeft < 5 * 60 * 1000) {
            timerEl.style.background = '#2f1a1a';
            timerEl.style.color = '#ff6b6b';
            timerEl.style.borderColor = '#ff6b6b';
        }
    }
    
    setInterval(updateTimer, 1000);
}

function showCooldownMessage(hours, minutes, seconds) {
    const msg = document.createElement('div');
    msg.className = 'mintflip-notification';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'mintflip-notification-header';
    header.innerHTML = 'MINT-FLIP COOLDOWN';
    header.style.color = '#48d19d';
    header.style.borderBottom = '1px solid #48d19d';
    
    // No close button
    
    // Create content
    const content = document.createElement('div');
    content.className = 'mintflip-notification-content';
    
    // Calculate total seconds for countdown
    let totalSeconds = (hours * 3600) + (minutes * 60) + (seconds || 0);
    
    // Create timer display
    const timerDiv = document.createElement('div');
    timerDiv.style.cssText = `
        background: #0f2f24;
        color: #48d19d;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        border: 1px solid #48d19d;
        margin: 10px 0;
        letter-spacing: 2px;
    `;
    
    function updateTimerDisplay() {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        timerDiv.textContent = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    
    updateTimerDisplay();
    
    // Create message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mintflip-notification-message';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.textAlign = 'center';
    messageDiv.innerHTML = '<strong>Your 45 minute session has ended</strong>';
    
    // Create cooldown label
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = `
        color: #48d19d;
        font-size: 14px;
        text-align: center;
        margin-top: 10px;
    `;
    labelDiv.textContent = 'Cooldown Time Remaining';
    
    content.appendChild(messageDiv);
    content.appendChild(timerDiv);
    content.appendChild(labelDiv);
    
    msg.appendChild(header);
    msg.appendChild(content);
    document.body.appendChild(msg);
    
    // Update timer every second
    const timerInterval = setInterval(() => {
        totalSeconds--;
        
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            msg.classList.add('closing');
            setTimeout(() => {
                if (msg.parentNode) msg.remove();
            }, 300);
            return;
        }
        
        updateTimerDisplay();
    }, 1000);
}
function showExpiredMessage() {
    const msg = document.createElement('div');
    msg.className = 'mintflip-notification';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'mintflip-notification-header';
    header.innerHTML = 'MINT-FLIP COOLDOWN';
    header.style.color = '#48d19d';
    header.style.borderBottom = '1px solid #48d19d';
    
    // No close button - can't be dismissed
    
    // Create content
    const content = document.createElement('div');
    content.className = 'mintflip-notification-content';
    
    // 🧪 TEST MODE: 30 seconds cooldown
    const cooldownEnd = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
    
    // Create timer display
    const timerDiv = document.createElement('div');
    timerDiv.style.cssText = `
        background: #0f2f24;
        color: #48d19d;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        border: 1px solid #48d19d;
        margin: 10px 0;
        letter-spacing: 2px;
    `;
    
    function updateTimerDisplay() {
        const now = Date.now();
        const timeLeft = Math.max(0, cooldownEnd - now);
        const seconds = Math.floor(timeLeft / 1000);
        
        timerDiv.textContent = `${seconds.toString().padStart(2, '0')}s`;
        
        // Auto-remove when done
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (msg.parentNode) {
                msg.classList.add('closing');
                setTimeout(() => msg.remove(), 300);
            }
        }
    }
    
    updateTimerDisplay();
    
    // Update every second
    const timerInterval = setInterval(updateTimerDisplay, 1000);
    
    // Create message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mintflip-notification-message';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.textAlign = 'center';
    messageDiv.innerHTML = '<strong>Your session has ended</strong>';
    
    // Create cooldown label
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = `
        color: #48d19d;
        font-size: 14px;
        text-align: center;
        margin-top: 10px;
    `;
    labelDiv.textContent = 'LIVE Countdown';
    
    content.appendChild(messageDiv);
    content.appendChild(timerDiv);
    content.appendChild(labelDiv);
    
    msg.appendChild(header);
    msg.appendChild(content);
    document.body.appendChild(msg);
}

    let initialized = false;

    function init() {
        if (initialized) return;
        if (document.querySelector('.mintflip-container')) return;
        
        initialized = true;
        
        const style = document.createElement('style');
        style.textContent = createStyles();
        document.head.appendChild(style);

        const elements = createBaseElements();
        
        // Start the header timer
        startHeaderTimer();
        
        // Get all four buttons
        const { minesBtn, towersBtn, blackjackBtn, aboutBtn } = createSidebarButtons();

        elements.sidebar.appendChild(minesBtn);
        elements.sidebar.appendChild(towersBtn);
        elements.sidebar.appendChild(blackjackBtn);
        elements.sidebar.appendChild(aboutBtn);

        const minesPanel = createMinesPanel();
        const towersPanel = createTowersPanel();
        const blackjackPanel = createBlackjackPanel();
        const aboutPanel = createAboutPanel();

        elements.mainContent.appendChild(minesPanel);
        elements.mainContent.appendChild(towersPanel);
        elements.mainContent.appendChild(blackjackPanel);
        elements.mainContent.appendChild(aboutPanel);

        // MINES tab
        minesBtn.onclick = () => {
            document.querySelectorAll('.mintflip-sidebar-item').forEach(el => el.classList.remove('active'));
            minesBtn.classList.add('active');
            document.querySelectorAll('.mintflip-panel').forEach(el => el.classList.remove('active'));
            minesPanel.classList.add('active');
            if (typeof window.clearHighlights === 'function') window.clearHighlights();
            if (typeof window.stopAutoPlay === 'function') window.stopAutoPlay();
            if (typeof window.stopAutoStart === 'function') window.stopAutoStart();
            if (typeof clearTowerHighlights === 'function') clearTowerHighlights();
            if (typeof stopBlackjackAutoPlay === 'function') stopBlackjackAutoPlay();
        };

        // TOWERS tab
        towersBtn.onclick = () => {
            document.querySelectorAll('.mintflip-sidebar-item').forEach(el => el.classList.remove('active'));
            towersBtn.classList.add('active');
            document.querySelectorAll('.mintflip-panel').forEach(el => el.classList.remove('active'));
            towersPanel.classList.add('active');
            if (typeof window.clearHighlights === 'function') window.clearHighlights();
            if (typeof window.stopAutoPlay === 'function') window.stopAutoPlay();
            if (typeof window.stopAutoStart === 'function') window.stopAutoStart();
            if (typeof clearTowerHighlights === 'function') clearTowerHighlights();
            if (typeof stopBlackjackAutoPlay === 'function') stopBlackjackAutoPlay();
        };

        // BLACKJACK tab
        blackjackBtn.onclick = () => {
            document.querySelectorAll('.mintflip-sidebar-item').forEach(el => el.classList.remove('active'));
            blackjackBtn.classList.add('active');
            document.querySelectorAll('.mintflip-panel').forEach(el => el.classList.remove('active'));
            blackjackPanel.classList.add('active');
            if (typeof window.clearHighlights === 'function') window.clearHighlights();
            if (typeof window.stopAutoPlay === 'function') window.stopAutoPlay();
            if (typeof window.stopAutoStart === 'function') window.stopAutoStart();
            if (typeof clearTowerHighlights === 'function') clearTowerHighlights();
        };

        // ABOUT tab
        aboutBtn.onclick = () => {
            document.querySelectorAll('.mintflip-sidebar-item').forEach(el => el.classList.remove('active'));
            aboutBtn.classList.add('active');
            document.querySelectorAll('.mintflip-panel').forEach(el => el.classList.remove('active'));
            aboutPanel.classList.add('active');
            if (typeof window.clearHighlights === 'function') window.clearHighlights();
            if (typeof window.stopAutoPlay === 'function') window.stopAutoPlay();
            if (typeof window.stopAutoStart === 'function') window.stopAutoStart();
            if (typeof clearTowerHighlights === 'function') clearTowerHighlights();
        };

        elements.closeBtn.onclick = () => {
            elements.mainGui.classList.add('closing');
            setTimeout(() => {
                elements.container.style.display = 'none';
                elements.overlay.style.display = 'none';
                elements.mainGui.classList.remove('closing');
                if (typeof window.clearHighlights === 'function') window.clearHighlights();
                if (typeof window.stopAutoPlay === 'function') window.stopAutoPlay();
                if (typeof window.stopAutoStart === 'function') window.stopAutoStart();
                if (typeof clearTowerHighlights === 'function') clearTowerHighlights();
                if (typeof stopBlackjackAutoPlay === 'function') stopBlackjackAutoPlay();
            }, 300);
        };

        // Initialize Mines with retry mechanism
        function initializeMines() {
            
            if (typeof window.updateMethodOptions !== 'function') {
                setTimeout(initializeMines, 500);
                return;
            }
            
            const methodEl = document.getElementById('prediction-method');
            if (!methodEl) {
                setTimeout(initializeMines, 500);
                return;
            }
            
            window.updateMethodOptions('random');
            
            // Small delay to ensure options are added
            setTimeout(() => {
                if (methodEl.options.length > 0) {
                    methodEl.value = 'random-3';
                } else {
                    setTimeout(initializeMines, 500);
                }
            }, 100);
        }

        // Start the initialization
        setTimeout(initializeMines, 300);
        
        // Setup all event handlers
        if (typeof setupEventHandlers === 'function') {
            setupEventHandlers();
        }
        
        // Make draggable
        let isDragging = false;
        let offsetX, offsetY;

        elements.header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('mintflip-close')) return;
            
            const rect = elements.container.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            isDragging = true;
            elements.header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            elements.container.style.left = (e.clientX - offsetX) + 'px';
            elements.container.style.top = (e.clientY - offsetY) + 'px';
            elements.container.style.transform = 'none';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            elements.header.style.cursor = 'move';
        });

        console.log('Mint-FLIP v1.0 - Loaded');
    }

// Wait for UID then initialize
waitForUID(async (uid) => {
    if (uid) {
        const sessionValid = await checkSession();
        if (!sessionValid) {
            return; // Stop script if in cooldown
        }
    } else {
        // No UID, try anonymous session
        const sessionValid = await checkSession();
        if (!sessionValid) return;
    }
    init();
});

// Remove the old init calls at the bottom
})();
