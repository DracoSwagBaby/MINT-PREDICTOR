// Blackjack Panel
function createBlackjackPanel() {
    const panel = document.createElement('div');
    panel.className = 'mintflip-panel';
    panel.id = 'blackjack-panel';
    panel.innerHTML = `
        <div class="mintflip-panel-title">BLACKJACK</div>

        <!-- BOT HAND -->
        <div class="blackjack-hand-display" id="bot-hand-container" style="border-color: #ff6b6b;">
            <div class="blackjack-hand-title">BOT HAND</div>
            <div class="blackjack-hand-value" id="blackjack-bot-hand">0</div>
        </div>

        <!-- YOUR HAND -->
        <div class="blackjack-hand-display" id="your-hand-container" style="border-color: #48d19d;">
            <div class="blackjack-hand-title">YOUR HAND</div>
            <div class="blackjack-hand-value" id="blackjack-your-hand">0</div>
        </div>

        <!-- AI TOGGLE -->
        <button class="mintflip-autostart-btn" id="blackjack-ai-selfplay">AI SELF PLAY: OFF</button>
    `;
    return panel;
}

// About Panel
function createAboutPanel() {
    const panel = document.createElement('div');
    panel.className = 'mintflip-panel';
    panel.id = 'about-panel';
    panel.innerHTML = `
        <div class="mintflip-panel-title">ABOUT</div>
        
        <div style="margin-bottom: 16px;">
            <div style="color: #48d19d; font-weight: 600; font-size: 18px; margin-bottom: 4px;">A: About Storing</div>
            <div style="color: #fff; font-size: 14px; line-height: 1.5;">MINT-FLIP is designed only to have fun without ever storing your personal information.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="color: #48d19d; font-weight: 600; font-size: 18px; margin-bottom: 4px;">B: Cookies</div>
            <div style="color: #fff; font-size: 14px; line-height: 1.5;">MINT-FLIP will never ask for or access your cookies or any sensible data.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="color: #48d19d; font-weight: 600; font-size: 18px; margin-bottom: 4px;">C: Local Only</div>
            <div style="color: #fff; font-size: 14px; line-height: 1.5;">100% local execution - all predictions happen on your device, nothing leaves your computer.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="color: #48d19d; font-weight: 600; font-size: 18px; margin-bottom: 4px;">D: Security</div>
            <div style="color: #fff; font-size: 14px; line-height: 1.5;">Anti-cracking protection with secure encrypted storage for your settings.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="color: #48d19d; font-weight: 600; font-size: 18px; margin-bottom: 4px;">E: Privacy</div>
            <div style="color: #fff; font-size: 14px; line-height: 1.5;">No data collection, no tracking, no passwords - just a clean product that respects you!</div>
        </div>
    `;
    return panel;
}
// Mines Panel (unchanged)
function createMinesPanel() {
    const panel = document.createElement('div');
    panel.className = 'mintflip-panel active';
    panel.id = 'mines-panel';
    panel.innerHTML = `
        <div class="mintflip-panel-title">MINES</div>
        <div class="mintflip-input-group">
            <label>MINES AMOUNT</label>
            <input type="number" class="mintflip-input" id="mines-count" min="1" max="24" value="3">
        </div>
        <div class="mintflip-input-group">
            <label>GRID SIZE</label>
            <input type="text" class="mintflip-input" id="grid-size" value="5x5">
        </div>
        
        <div class="mintflip-category-selector" id="category-selector">
            <button class="mintflip-category-btn active" data-category="random">RANDOM</button>
            <button class="mintflip-category-btn" data-category="corner">CORNER</button>
            <button class="mintflip-category-btn" data-category="pattern">PATTERN</button>
            <button class="mintflip-category-btn" data-category="probability">PROB</button>
            <button class="mintflip-category-btn" data-category="risk">RISK</button>
            <button class="mintflip-category-btn" data-category="historical">HIST</button>
            <button class="mintflip-category-btn" data-category="advanced">ADV</button>
        </div>

        <div class="mintflip-input-group">
            <label>METHOD</label>
            <select class="mintflip-select" id="prediction-method"></select>
        </div>

        <div class="mintflip-method-display" id="current-method">Random 3 Tiles (5x5)</div>
        
        <button class="mintflip-predict-btn" id="predict-btn">PREDICT</button>
        <button class="mintflip-autoplay-btn" id="autoplay-btn">AUTO PLAY: OFF</button>
        <button class="mintflip-autocashout-btn" id="autocashout-btn">AUTO CASHOUT: OFF</button>
        <button class="mintflip-autostart-btn" id="autostart-btn">AUTO START: OFF</button>
        <button class="mintflip-clear-btn" id="clear-btn">CLEAR</button>
    `;
    return panel;
}

// Towers Panel (unchanged)
function createTowersPanel() {
    const panel = document.createElement('div');
    panel.className = 'mintflip-panel';
    panel.id = 'towers-panel';
    panel.innerHTML = `
        <div class="mintflip-panel-title">TOWERS</div>
        
        <div class="mintflip-input-group">
            <label>DIFFICULTY</label>
            <select class="mintflip-select" id="towers-difficulty">
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
            </select>
        </div>

        <div class="mintflip-input-group">
            <label>BET AMOUNT</label>
            <input type="number" class="mintflip-input" id="towers-bet" min="25" value="25">
        </div>

        <div class="mintflip-input-group">
            <label>METHOD</label>
            <select class="mintflip-select" id="towers-method">
                <option value="same-column">Same Column</option>
                <option value="zigzag">Zigzag</option>
                <option value="highest-value">Highest Value</option>
                <option value="random-any">Random Any Rows</option>
                <option value="random-3">Random 3 Rows</option>
                <option value="random-5">Random 5 Rows</option>
                <option value="random-8">Random 8 Rows</option>
                <option value="alternating">Alternating</option>
                <option value="middle-column">Middle Column</option>
                <option value="edges">Edges Only</option>
                <option value="progressive">Progressive</option>
                <option value="safe-zone">Safe Zone</option>
                <option value="martingale">Martingale</option>
            </select>
        </div>
        
        <button class="mintflip-predict-btn" id="towers-predict-btn">PREDICT</button>
        <button class="mintflip-autoplay-btn" id="towers-autoplay-btn">AUTO PLAY: OFF</button>
        <button class="mintflip-autocashout-btn" id="towers-autocashout-btn">AUTO CASHOUT: OFF</button>
        <button class="mintflip-autostart-btn" id="towers-autostart-btn">AUTO START: OFF</button>
        <button class="mintflip-clear-btn" id="towers-clear-btn">CLEAR</button>
    `;
    return panel;
}

// Blackjack Panel (unchanged)
function createBlackjackPanel() {
    const panel = document.createElement('div');
    panel.className = 'mintflip-panel';
    panel.id = 'blackjack-panel';
    panel.innerHTML = `
        <div class="mintflip-panel-title">BLACKJACK</div>

        <!-- BOT HAND Display (TOP) -->
        <div class="blackjack-hand-display" id="bot-hand-container" style="border-color: #ff6b6b;">
            <div class="blackjack-hand-title">BOT HAND</div>
            <div class="blackjack-hand-value" id="blackjack-bot-hand" style="color: #ff6b6b;">0</div>
        </div>

        <!-- YOUR HAND Display (BOTTOM) -->
        <div class="blackjack-hand-display" id="your-hand-container" style="border-color: #48d19d; margin-top: 10px;">
            <div class="blackjack-hand-title">YOUR HAND</div>
            <div class="blackjack-hand-value" id="blackjack-your-hand" style="color: #48d19d;">0</div>
        </div>

        <!-- AI SELF PLAY Toggle -->
        <button class="mintflip-autostart-btn" id="blackjack-ai-selfplay">AI SELF PLAY: OFF</button>
    `;
    return panel;
}

// Sidebar Buttons (unchanged)
function createSidebarButtons() {
    const minesBtn = document.createElement('div');
    minesBtn.className = 'mintflip-sidebar-item active';
    minesBtn.textContent = 'MINES';
    
    const towersBtn = document.createElement('div');
    towersBtn.className = 'mintflip-sidebar-item';
    towersBtn.textContent = 'TOWERS';
    
    const blackjackBtn = document.createElement('div');
    blackjackBtn.className = 'mintflip-sidebar-item';
    blackjackBtn.textContent = 'BLACKJACK';
    
    const aboutBtn = document.createElement('div');
    aboutBtn.className = 'mintflip-sidebar-item';
    aboutBtn.textContent = 'ABOUT';
    
    return { minesBtn, towersBtn, blackjackBtn, aboutBtn };
}
