function createStyles() {
    return `
        .mintflip-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 99999998;
            display: block;
            pointer-events: none;
        }

        .mintflip-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 99999999;
            pointer-events: none;
        }

        .mintflip-main {
            width: 550px;
            max-height: 55vh;
            background: #0c0c0c;
            border-radius: 12px;
            border: 1px solid #1a4d3e;
            box-shadow: 0 0 20px rgba(72, 209, 157, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            pointer-events: auto;
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .mintflip-autoplay-btn.active, 
        .mintflip-autocashout-btn.active, 
        .mintflip-autostart-btn.active {
            background: #0f2f24;
            color: #48d19d;
            border-color: #48d19d;
        }

        /* Blackjack Styles */
        .blackjack-hand-display {
            background: #111111;
            border: 1px solid #1a4d3e;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            text-align: center;
        }

        .blackjack-hand-title {
            color: #2a8b6f;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .blackjack-hand-value {
            color: #48d19d;
            font-size: 36px;
            font-weight: bold;
            font-family: monospace;
        }

        .mintflip-main.closing {
            animation: popOut 0.3s ease forwards;
        }

        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }

        @keyframes popOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.8); }
        }

        .mintflip-header {
            background: #111111;
            padding: 16px 20px;
            border-radius: 11px 11px 0 0;
            color: #48d19d;
            font-size: 22px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            border-bottom: 1px solid #1a4d3e;
            letter-spacing: 0.5px;
            user-select: none;
            flex-shrink: 0;
        }

        .mintflip-close {
            background: transparent;
            color: #2a8b6f;
            border: 1px solid #1a4d3e;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .mintflip-close:hover {
            background: #1a4d3e;
            color: #ffffff;
            border-color: #48d19d;
        }

        .mintflip-content {
            display: flex;
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }

        .mintflip-sidebar {
            width: 140px;
            background: #111111;
            border-right: 2px solid #1a4d3e;
            padding: 12px 0;
            flex-shrink: 0;
            overflow-y: auto;
        }

        .mintflip-sidebar-item {
            padding: 10px 15px;
            color: #cccccc;
            font-size: 15px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid transparent;
            margin: 2px 0;
        }

        .mintflip-sidebar-item:hover {
            background: #1a4d3e;
            color: #48d19d;
            border-left: 3px solid #48d19d;
        }

        .mintflip-sidebar-item.active {
            background: #1a4d3e;
            color: #48d19d;
            border-left: 3px solid #48d19d;
        }

        .mintflip-main-content {
            flex: 1;
            padding: 20px;
            background: #0c0c0c;
            overflow-y: auto;
            max-height: 100%;
            display: flex;
            flex-direction: column;
        }

        .mintflip-panel {
            display: none;
            height: 100%;
            flex-direction: column;
        }

        .mintflip-panel.active {
            display: flex;
        }

        .mintflip-panel-title {
            color: #48d19d;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .mintflip-input-group {
            margin-bottom: 15px;
        }

        .mintflip-input-group label {
            display: block;
            color: #2a8b6f;
            font-size: 13px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .mintflip-input, .mintflip-select {
            width: 100%;
            padding: 10px 12px;
            background: #111111;
            border: 1px solid #1a4d3e;
            border-radius: 6px;
            color: #ffffff;
            font-size: 14px;
            box-sizing: border-box;
            transition: all 0.2s;
        }

        .mintflip-select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2348d19d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
        }

        .mintflip-input:focus, .mintflip-select:focus {
            outline: none;
            border-color: #48d19d;
            background: #151515;
        }

        .mintflip-input-hint {
            color: #2a8b6f;
            font-size: 11px;
            margin-top: 4px;
            opacity: 0.7;
        }

        .mintflip-category-selector {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }

        .mintflip-category-btn {
            flex: 1;
            min-width: 60px;
            padding: 8px 5px;
            background: transparent;
            color: #2a8b6f;
            border: 1px solid #1a4d3e;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
        }

        .mintflip-category-btn:hover {
            background: #1a4d3e;
            color: #48d19d;
        }

        .mintflip-category-btn.active {
            background: #1a4d3e;
            color: #48d19d;
            border-color: #48d19d;
        }

        .mintflip-method-display {
            color: #48d19d;
            font-size: 12px;
            margin: 10px 0;
            padding: 8px;
            background: #111111;
            border-radius: 4px;
            text-align: center;
            border-left: 3px solid #48d19d;
        }

        .mintflip-predict-btn, .mintflip-autoplay-btn, .mintflip-autocashout-btn, .mintflip-autostart-btn {
            width: 100%;
            padding: 10px;
            background: transparent;
            color: #2a8b6f;
            border: 1px solid #1a4d3e;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 3px 0;
        }

        .mintflip-predict-btn {
            background: #0f2f24;
            color: #48d19d;
            border: 1px solid #2a8b6f;
            margin: 10px 0 5px 0;
            padding: 12px;
            font-size: 16px;
        }

        .mintflip-predict-btn:hover {
            background: #1a4d3e;
            color: #ffffff;
        }

        .mintflip-autoplay-btn.active, .mintflip-autocashout-btn.active, .mintflip-autostart-btn.active {
            background: #0f2f24;
            color: #48d19d;
            border-color: #48d19d;
        }

        .mintflip-clear-btn {
            width: 100%;
            padding: 8px;
            background: transparent;
            color: #2a8b6f;
            border: 1px dashed #1a4d3e;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            margin: 10px 0 15px 0;
        }

        .mintflip-clear-btn:hover {
            background: #1a1a1a;
            color: #48d19d;
        }

        .mintflip-footer {
            color: #2a8b6f;
            text-align: center;
            font-size: 11px;
            padding: 12px 0;
            border-top: 1px solid #1a4d3e;
            letter-spacing: 0.5px;
            flex-shrink: 0;
            margin-top: auto;
            background: #0c0c0c;
        }

        .mintflip-main-content::-webkit-scrollbar, .mintflip-sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .mintflip-main-content::-webkit-scrollbar-track, .mintflip-sidebar::-webkit-scrollbar-track {
            background: #111111;
        }

        .mintflip-main-content::-webkit-scrollbar-thumb, .mintflip-sidebar::-webkit-scrollbar-thumb {
            background: #1a4d3e;
            border-radius: 3px;
        }

        .mintflip-main-content::-webkit-scrollbar-thumb:hover, .mintflip-sidebar::-webkit-scrollbar-thumb:hover {
            background: #48d19d;
        }
    `;
}

// Blackjack hand display helper
function createBlackjackHandDisplay() {
    const container = document.createElement('div');
    container.id = 'blackjack-hand-display';
    container.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 8px;
        padding: 12px;
        margin: 10px 15px;
        text-align: center;
        border: 1px solid #00ff00;
        box-shadow: 0 0 10px rgba(0,255,0,0.2);
    `;
    
    container.innerHTML = `
        <div style="font-size: 11px; color: #00ff00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">YOUR HAND</div>
        <div style="font-size: 42px; font-weight: bold; color: white; line-height: 1;" id="blackjack-hand-value">0</div>
        <div style="font-size: 10px; color: #666; margin-top: 5px;">live</div>
    `;
    
    return container;
}

// Function to update hand value
function updateBlackjackHand(value) {
    const handElement = document.getElementById('blackjack-hand-value');
    if (handElement) {
        handElement.textContent = value;
        // Flash effect
        handElement.style.color = '#00ff00';
        setTimeout(() => {
            handElement.style.color = 'white';
        }, 200);
    }
}

function createBaseElements() {
    const overlay = document.createElement('div');
    overlay.className = 'mintflip-overlay';
    
    const container = document.createElement('div');
    container.className = 'mintflip-container';
    
    const mainGui = document.createElement('div');
    mainGui.className = 'mintflip-main';
    
    const header = document.createElement('div');
    header.className = 'mintflip-header';
    
    // Create left side with title
    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const title = document.createElement('span');
    title.textContent = 'MINT-FLIP | PREDICTOR';
    title.style.color = '#48d19d';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    
    // Create timer button
    const timerBox = document.createElement('div');
    timerBox.id = 'mintflip-header-timer';
    timerBox.style.cssText = `
        background: #0f2f24;
        color: #48d19d;
        padding: 4px 12px;
        border-radius: 30px;
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        border: 1px solid #48d19d;
        letter-spacing: 1px;
    `;
    timerBox.textContent = '45:00';
    
    headerLeft.appendChild(title);
    headerLeft.appendChild(timerBox);
    
    // Right side with close button
    const headerRight = document.createElement('div');
    headerRight.style.cssText = `
        display: flex;
        align-items: center;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mintflip-close';
    closeBtn.innerHTML = '×';
    
    headerRight.appendChild(closeBtn);
    
    // Assemble header
    header.appendChild(headerLeft);
    header.appendChild(headerRight);
    
    const content = document.createElement('div');
    content.className = 'mintflip-content';
    
    const sidebar = document.createElement('div');
    sidebar.className = 'mintflip-sidebar';
    
    const mainContent = document.createElement('div');
    mainContent.className = 'mintflip-main-content';
    
    const footer = document.createElement('div');
    footer.className = 'mintflip-footer';
    footer.textContent = 'MINT-FLIP PREDICTOR v1.0';
    
    content.appendChild(sidebar);
    content.appendChild(mainContent);
    
    mainGui.appendChild(header);
    mainGui.appendChild(content);
    mainGui.appendChild(footer);
    container.appendChild(mainGui);
    
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    
    return { overlay, container, mainGui, header, closeBtn, sidebar, mainContent, footer };
}
