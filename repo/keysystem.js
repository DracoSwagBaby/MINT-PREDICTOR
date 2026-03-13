// ==UserScript==
// @name         Mint-FLIP - Key System
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Key system for Mint-FLIP
// @author       You
// @match        https://www.roblox.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Check if we're on the profile page
    const isOnProfilePage = window.location.href.includes('/users/profile') || 
                           window.location.href.includes('/profile') ||
                           document.querySelector('[data-userid]') !== null;

    // If not on profile page, show notification and stop
    if (!isOnProfilePage) {
        showNotification();
        return; // Stop the key system from loading
    }

    // Add styles for key system
    const style = document.createElement('style');
    style.textContent = `
        .mintflip-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            backdrop-filter: blur(6px);
            z-index: 999998;
            display: block;
            transition: backdrop-filter 0.3s ease;
            pointer-events: none;
        }

        .mintflip-overlay.no-blur {
            backdrop-filter: none;
            background: transparent;
        }

        .mintflip-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            gap: 2px;
            z-index: 999999;
            pointer-events: none;
        }

        .mintflip-main {
            width: 360px;
            background: #0c0c0c;
            border-radius: 12px;
            border: 1px solid #1a4d3e;
            box-shadow: 0 0 20px rgba(72, 209, 157, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            pointer-events: auto;
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .mintflip-main.closing {
            animation: popOut 0.3s ease forwards;
        }

        .mintflip-tutorial {
            width: 360px;
            background: #0c0c0c;
            border-radius: 12px;
            border: 1px solid #1a4d3e;
            box-shadow: 0 0 20px rgba(72, 209, 157, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            pointer-events: auto;
            display: none;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .mintflip-tutorial.closing {
            animation: popOut 0.2s ease forwards;
        }

        .mintflip-tutorial.visible {
            display: block;
        }

        .mintflip-premium {
            width: 360px;
            background: #0c0c0c;
            border-radius: 12px;
            border: 1px solid #ffd700;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            pointer-events: auto;
            display: none;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .mintflip-premium.closing {
            animation: popOut 0.2s ease forwards;
        }

        .mintflip-premium.visible {
            display: block;
        }

        @keyframes popIn {
            0% {
                opacity: 0;
                transform: scale(0.8);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes popOut {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0.8);
            }
        }

        @keyframes goldPulse {
            0%, 100% {
                border-color: #ffd700;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
            }
            50% {
                border-color: #ffaa00;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            }
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
        }

        .mintflip-premium-header {
            background: #1a1a1a;
            padding: 16px 20px;
            border-radius: 11px 11px 0 0;
            color: #ffd700;
            font-size: 22px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ffd700;
            letter-spacing: 0.5px;
            animation: goldPulse 2s infinite;
        }

        .mintflip-header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .mintflip-tutorial-header {
            background: #111111;
            padding: 16px 20px;
            border-radius: 11px 11px 0 0;
            color: #48d19d;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1a4d3e;
            letter-spacing: 0.5px;
        }

        .mintflip-close {
            background: transparent;
            color: #2a8b6f;
            border: 1px solid #1a4d3e;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 400;
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

        .mintflip-premium-close {
            background: transparent;
            color: #ffd700;
            border: 1px solid #ffd700;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 400;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .mintflip-premium-close:hover {
            background: #ffd700;
            color: #000000;
            border-color: #ffd700;
        }

        .mintflip-content {
            padding: 24px;
            background: #0c0c0c;
            border-radius: 0 0 11px 11px;
        }

        .mintflip-tutorial-content {
            padding: 20px 24px;
            background: #0c0c0c;
            border-radius: 0 0 11px 11px;
        }

        .mintflip-premium-content {
            padding: 20px 24px 24px 24px;
            background: #0c0c0c;
            border-radius: 0 0 11px 11px;
        }

        .mintflip-title {
            color: #48d19d;
            font-size: 24px;
            text-align: center;
            margin-bottom: 24px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .mintflip-premium-title {
            color: #ffd700;
            font-size: 24px;
            text-align: center;
            margin-bottom: 20px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .mintflip-input {
            width: 100%;
            padding: 14px;
            background: #111111;
            border: 1px solid #1a4d3e;
            border-radius: 6px;
            color: #ffffff;
            font-size: 16px;
            text-align: center;
            margin-bottom: 20px;
            box-sizing: border-box;
            font-family: 'Monaco', 'Menlo', monospace;
            letter-spacing: 2px;
            transition: all 0.2s;
        }

        .mintflip-input:focus {
            outline: none;
            border-color: #48d19d;
            background: #151515;
            box-shadow: 0 0 15px rgba(72, 209, 157, 0.15);
        }

        .mintflip-input::placeholder {
            color: #666666;
            letter-spacing: normal;
            font-size: 14px;
        }

        .mintflip-login-btn {
            width: 100%;
            padding: 14px;
            background: #0f2f24;
            color: #48d19d;
            border: 1px solid #2a8b6f;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        .mintflip-login-btn:hover {
            background: #1a4d3e;
            border-color: #48d19d;
            color: #ffffff;
        }

        .mintflip-login-btn:active {
            transform: translateY(1px);
        }

        .mintflip-nokey-btn {
            width: 100%;
            padding: 12px;
            background: transparent;
            color: #2a8b6f;
            border: 1px dashed #1a4d3e;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .mintflip-nokey-btn:hover {
            background: #1a4d3e;
            color: #48d19d;
            border-color: #48d19d;
            border-style: solid;
        }

        .mintflip-premium-btn {
            width: 100%;
            padding: 12px;
            background: transparent;
            color: #ffd700;
            border: 1px dashed #ffd700;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }

        .mintflip-premium-btn:hover {
            background: #332a00;
            color: #ffd700;
            border-color: #ffd700;
            border-style: solid;
        }

        .mintflip-toggle-btn {
            width: 100%;
            padding: 14px;
            background: transparent;
            color: #2a8b6f;
            border: 1px solid #1a4d3e;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }

        .mintflip-toggle-btn:hover {
            background: #1a4d3e;
            color: #48d19d;
            border-color: #48d19d;
        }

        .mintflip-error {
            color: #ff6b6b;
            text-align: center;
            font-size: 13px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #4d1a1a;
            background: rgba(100, 0, 0, 0.1);
            border-radius: 6px;
            display: none;
            font-weight: 500;
        }

        .mintflip-footer {
            color: #2a8b6f;
            text-align: center;
            font-size: 11px;
            margin-top: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-top: 1px solid #1a4d3e;
            padding-top: 16px;
        }

        .mintflip-copyright {
            color: #2a8b6f;
            text-align: center;
            font-size: 10px;
            margin-top: 8px;
            letter-spacing: 0.5px;
            opacity: 0.8;
        }

        .mintflip-success {
            width: 100%;
            padding: 14px;
            background: #0f2f24;
            color: #48d19d;
            border: 1px solid #48d19d;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            display: none;
        }

        .premium-price {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #1a1a1a;
            border-radius: 8px;
            border: 1px solid #ffd700;
        }

        .premium-price .amount {
            color: #ffd700;
            font-size: 32px;
            font-weight: 800;
            line-height: 1.2;
        }

        .premium-price .label {
            color: #cccccc;
            font-size: 14px;
            margin-top: 5px;
        }

        .premium-step {
            margin-bottom: 20px;
        }

        .premium-step h3 {
            color: #ffd700;
            font-size: 16px;
            margin: 0 0 5px 0;
            font-weight: 600;
        }

        .premium-step p {
            color: #cccccc;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
        }

        .premium-highlight {
            color: #ffd700;
            font-weight: bold;
            background: #332a00;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }

        .premium-footer {
            margin-top: 20px;
            text-align: center;
            color: #ffd700;
            font-size: 13px;
            border-top: 1px solid #333333;
            padding-top: 15px;
        }

        .premium-footer p {
            margin: 5px 0;
            color: #ffd700;
        }

        .premium-footer .gamepass {
            color: #ffd700;
            font-size: 12px;
            opacity: 0.9;
            font-family: monospace;
        }

        .tutorial-step {
            margin-bottom: 20px;
        }

        .tutorial-step h3 {
            color: #48d19d;
            font-size: 16px;
            margin: 0 0 5px 0;
            font-weight: 600;
        }

        .tutorial-step p {
            color: #cccccc;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
        }

        .tutorial-highlight {
            color: #48d19d;
            font-weight: bold;
            background: #1a4d3e;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }

        .tutorial-note {
            margin-top: 20px;
            padding: 12px;
            background: #111111;
            border-radius: 6px;
            border-left: 3px solid #48d19d;
        }

        .tutorial-note p {
            color: #cccccc;
            font-size: 13px;
            margin: 5px 0;
        }

        .tutorial-note .highlight {
            color: #48d19d;
            font-family: monospace;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mintflip-overlay';
    document.body.appendChild(overlay);

    // Create main container wrapper
    const container = document.createElement('div');
    container.className = 'mintflip-container';

    // Create main GUI
    const mainGui = document.createElement('div');
    mainGui.className = 'mintflip-main';

    // Create tutorial panel
    const tutorialPanel = document.createElement('div');
    tutorialPanel.className = 'mintflip-tutorial';

    // Create premium panel
    const premiumPanel = document.createElement('div');
    premiumPanel.className = 'mintflip-premium';

    // Create header for main GUI
    const header = document.createElement('div');
    header.className = 'mintflip-header';
    header.textContent = 'MINT-FLIP | .gg/mintflip';

    // Create right section for FREE badge and close button
    const headerRight = document.createElement('div');
    headerRight.className = 'mintflip-header-right';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mintflip-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
        // Add closing animation to main GUI
        mainGui.classList.add('closing');
        
        // If tutorial is open, close it with animation too
        if (tutorialPanel.classList.contains('visible')) {
            tutorialPanel.classList.add('closing');
        }
        
        // If premium is open, close it with animation too
        if (premiumPanel.classList.contains('visible')) {
            premiumPanel.classList.add('closing');
        }
        
        // Wait for animations to finish before hiding
        setTimeout(() => {
            container.style.display = 'none';
            overlay.style.display = 'none';
            // Reset classes
            mainGui.classList.remove('closing');
            tutorialPanel.classList.remove('closing');
            premiumPanel.classList.remove('closing');
        }, 300);
    };

    headerRight.appendChild(closeBtn);
    
    // Assemble header
    header.appendChild(headerRight);

    // Create header for tutorial
    const tutorialHeader = document.createElement('div');
    tutorialHeader.className = 'mintflip-tutorial-header';
    tutorialHeader.innerHTML = 'EASY KEY TUTORIAL';

    // Create close button for tutorial
    const tutorialCloseBtn = document.createElement('button');
    tutorialCloseBtn.className = 'mintflip-close';
    tutorialCloseBtn.innerHTML = '×';
    tutorialCloseBtn.onclick = () => {
        // Add closing animation
        tutorialPanel.classList.add('closing');
        
        // Wait for animation to finish
        setTimeout(() => {
            tutorialPanel.classList.remove('visible');
            tutorialPanel.classList.remove('closing');
            nokeyBtn.style.background = 'transparent';
            nokeyBtn.style.color = '#2a8b6f';
            nokeyBtn.style.borderStyle = 'dashed';
        }, 200);
    };

    tutorialHeader.appendChild(tutorialCloseBtn);

    // Create header for premium
    const premiumHeader = document.createElement('div');
    premiumHeader.className = 'mintflip-premium-header';
    premiumHeader.innerHTML = 'GET PREMIUM';

    // Create close button for premium
    const premiumCloseBtn = document.createElement('button');
    premiumCloseBtn.className = 'mintflip-premium-close';
    premiumCloseBtn.innerHTML = '×';
    premiumCloseBtn.onclick = () => {
        // Add closing animation
        premiumPanel.classList.add('closing');
        
        // Wait for animation to finish
        setTimeout(() => {
            premiumPanel.classList.remove('visible');
            premiumPanel.classList.remove('closing');
            premiumBtn.style.background = 'transparent';
            premiumBtn.style.color = '#ffd700';
            premiumBtn.style.borderStyle = 'dashed';
        }, 200);
    };

    premiumHeader.appendChild(premiumCloseBtn);

    // Create content for main GUI
    const content = document.createElement('div');
    content.className = 'mintflip-content';

    // Add title
    const title = document.createElement('div');
    title.className = 'mintflip-title';

    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mintflip-input';
    input.placeholder = 'ENTER KEY';
    input.maxLength = 20;

    // Create login button
    const loginBtn = document.createElement('button');
    loginBtn.className = 'mintflip-login-btn';
    loginBtn.textContent = 'LOGIN';

    // Create NO KEY button
    const nokeyBtn = document.createElement('button');
    nokeyBtn.className = 'mintflip-nokey-btn';
    nokeyBtn.textContent = 'NO KEY?';

    // Create GET PREMIUM button
    const premiumBtn = document.createElement('button');
    premiumBtn.className = 'mintflip-premium-btn';
    premiumBtn.textContent = 'GET PREMIUM';

    // Create blur toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mintflip-toggle-btn';
    toggleBtn.textContent = 'BLUR: ON';

    // Create error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'mintflip-error';
    errorMsg.textContent = 'INVALID KEY';

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'mintflip-footer';
    footer.textContent = 'SYSTEM READY';

    // Create copyright line
    const copyright = document.createElement('div');
    copyright.className = 'mintflip-copyright';
    copyright.innerHTML = 'MINT-FLIP © 2026';

    // Create tutorial content
    const tutorialContent = document.createElement('div');
    tutorialContent.className = 'mintflip-tutorial-content';

    tutorialContent.innerHTML = `
        <div class="tutorial-step">
            <h3>STEP 1: Join Discord</h3>
            <p>Join our official Discord server to get access to beta keys.</p>
        </div>
        
        <div class="tutorial-step">
            <h3>STEP 2: Get Your Key</h3>
            <p>Go to <span class="tutorial-highlight">#key-channel</span> and type <span class="tutorial-highlight">!getkey</span></p>
        </div>
        
        <div class="tutorial-step">
            <h3>STEP 3: Enter Key</h3>
            <p>Copy your unique key and paste it in the main window</p>
        </div>
        
        <div class="tutorial-step">
            <h3>STEP 4: Enjoy</h3>
            <p>Once verified, you'll get full access to Mint-FLIP</p>
        </div>
        
        <div class="tutorial-note">
            <p><span class="highlight">Key format:</span> XXXX-XXXX-XXXX</p>
            <p><span style="color: #48d19d;">Keys are free and refresh daily!</span></p>
        </div>
    `;

    // Create premium content
    const premiumContent = document.createElement('div');
    premiumContent.className = 'mintflip-premium-content';

    premiumContent.innerHTML = `
        <div class="premium-price">
            <div class="amount">1,200 ROBUX</div>
            <div class="label">LIFETIME PREMIUM ACCESS</div>
        </div>

        <div class="premium-step">
            <h3>STEP 1: Purchase Gamepass</h3>
            <p>Buy the <span class="premium-highlight">"Mint-FLIP Premium"</span> gamepass for 1,200 Robux</p>
        </div>
        
        <div class="premium-step">
            <h3>STEP 2: Join Discord</h3>
            <p>Join our official Discord server and verify your purchase</p>
        </div>
        
        <div class="premium-step">
            <h3>STEP 3: Get Premium Key</h3>
            <p>Go to <span class="premium-highlight">#premium-keys</span> and type <span class="premium-highlight">!redeem</span></p>
        </div>
        
        <div class="premium-step">
            <h3>STEP 4: Enter Key</h3>
            <p>Copy your premium key and paste it in the main window</p>
        </div>
    `;

    // Assemble tutorial panel
    tutorialPanel.appendChild(tutorialHeader);
    tutorialPanel.appendChild(tutorialContent);

    // Assemble premium panel
    premiumPanel.appendChild(premiumHeader);
    premiumPanel.appendChild(premiumContent);

    // Blur toggle functionality
    let blurEnabled = true;
    
    toggleBtn.addEventListener('click', function() {
        blurEnabled = !blurEnabled;
        
        if (blurEnabled) {
            overlay.classList.remove('no-blur');
            toggleBtn.textContent = 'BLUR: ON';
            toggleBtn.style.color = '#48d19d';
        } else {
            overlay.classList.add('no-blur');
            toggleBtn.textContent = 'BLUR: OFF';
            toggleBtn.style.color = '#4d4d4d';
        }
    });

    // NO KEY button functionality
    nokeyBtn.addEventListener('click', function() {
        // Close premium if open
        if (premiumPanel.classList.contains('visible')) {
            premiumPanel.classList.add('closing');
            setTimeout(() => {
                premiumPanel.classList.remove('visible');
                premiumPanel.classList.remove('closing');
                premiumBtn.style.background = 'transparent';
                premiumBtn.style.color = '#ffd700';
                premiumBtn.style.borderStyle = 'dashed';
            }, 200);
        }
        
        // Toggle tutorial
        if (!tutorialPanel.classList.contains('visible')) {
            tutorialPanel.classList.remove('closing');
            tutorialPanel.classList.add('visible');
            
            nokeyBtn.style.background = '#1a4d3e';
            nokeyBtn.style.color = '#48d19d';
            nokeyBtn.style.borderStyle = 'solid';
        } else {
            tutorialPanel.classList.add('closing');
            
            setTimeout(() => {
                tutorialPanel.classList.remove('visible');
                tutorialPanel.classList.remove('closing');
                nokeyBtn.style.background = 'transparent';
                nokeyBtn.style.color = '#2a8b6f';
                nokeyBtn.style.borderStyle = 'dashed';
            }, 200);
        }
        
        overlay.style.backgroundColor = 'transparent';
    });

    // GET PREMIUM button functionality
    premiumBtn.addEventListener('click', function() {
        // Close tutorial if open
        if (tutorialPanel.classList.contains('visible')) {
            tutorialPanel.classList.add('closing');
            setTimeout(() => {
                tutorialPanel.classList.remove('visible');
                tutorialPanel.classList.remove('closing');
                nokeyBtn.style.background = 'transparent';
                nokeyBtn.style.color = '#2a8b6f';
                nokeyBtn.style.borderStyle = 'dashed';
            }, 200);
        }
        
        // Toggle premium
        if (!premiumPanel.classList.contains('visible')) {
            premiumPanel.classList.remove('closing');
            premiumPanel.classList.add('visible');
            
            premiumBtn.style.background = '#332a00';
            premiumBtn.style.color = '#ffd700';
            premiumBtn.style.borderStyle = 'solid';
        } else {
            premiumPanel.classList.add('closing');
            
            setTimeout(() => {
                premiumPanel.classList.remove('visible');
                premiumPanel.classList.remove('closing');
                premiumBtn.style.background = 'transparent';
                premiumBtn.style.color = '#ffd700';
                premiumBtn.style.borderStyle = 'dashed';
            }, 200);
        }
        
        overlay.style.backgroundColor = 'transparent';
    });

    // Login button functionality
    loginBtn.addEventListener('click', function() {
        const key = input.value.trim().toUpperCase();
        
        if (key === '2M4P-9K7D-X8R1') {
            errorMsg.style.display = 'none';
            loginBtn.style.display = 'none';
            input.style.display = 'none';
            toggleBtn.style.display = 'none';
            nokeyBtn.style.display = 'none';
            premiumBtn.style.display = 'none';
            
            const successMsg = document.createElement('div');
            successMsg.className = 'mintflip-success';
            successMsg.textContent = 'ACCESS GRANTED';
            content.insertBefore(successMsg, footer);
            successMsg.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
                overlay.style.display = 'none';
            }, 1500);
        } else {
            errorMsg.style.display = 'block';
            input.value = '';
            input.focus();
            
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 5000);
            
            mainGui.style.transform = 'translateX(3px)';
            setTimeout(() => {
                mainGui.style.transform = 'translateX(0)';
            }, 100);
        }
    });

    // Enter key functionality
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    // Assemble main GUI
    content.appendChild(title);
    content.appendChild(input);
    content.appendChild(loginBtn);
    content.appendChild(nokeyBtn);
    content.appendChild(premiumBtn);
    content.appendChild(toggleBtn);
    content.appendChild(errorMsg);
    content.appendChild(footer);
    content.appendChild(copyright);

    mainGui.appendChild(header);
    mainGui.appendChild(content);

    // Add panels to container
    container.appendChild(mainGui);
    container.appendChild(tutorialPanel);
    container.appendChild(premiumPanel);

    document.body.appendChild(container);

    // Make draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target === closeBtn || e.target === toggleBtn || e.target === nokeyBtn || e.target === premiumBtn || e.target === tutorialCloseBtn || e.target === premiumCloseBtn) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            header.style.cursor = 'grabbing';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, container);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd(e) {
        isDragging = false;
        header.style.cursor = 'move';
    }

    setTimeout(() => {
        input.focus();
    }, 100);

    console.log('Mint-FLIP Key System Loaded');

    // Function to show notification (copied from your notification script)
    function showNotification() {
        const notifStyle = document.createElement('style');
        notifStyle.textContent = `
            .mintflip-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: #0c0c0c;
                border-radius: 12px;
                border: 1px solid #1a4d3e;
                box-shadow: 0 0 30px rgba(72, 209, 157, 0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                z-index: 9999999;
                animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
            }

            .mintflip-notification.closing {
                animation: slideOutRight 0.3s ease forwards;
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }

            .mintflip-notification-header {
                background: #111111;
                padding: 15px 20px;
                color: #48d19d;
                font-size: 20px;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #1a4d3e;
                letter-spacing: 0.5px;
            }

            .mintflip-notification-close {
                background: transparent;
                color: #2a8b6f;
                border: 1px solid #1a4d3e;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 400;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .mintflip-notification-close:hover {
                background: #1a4d3e;
                color: #ffffff;
            }

            .mintflip-notification-content {
                padding: 20px;
                background: #0c0c0c;
            }

            .mintflip-notification-message {
                color: #cccccc;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 20px;
            }

            .mintflip-notification-message strong {
                color: #48d19d;
                font-weight: 600;
            }

            .mintflip-notification-button {
                background: transparent;
                color: #48d19d;
                border: 1px solid #2a8b6f;
                padding: 12px 15px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 1px;
                width: 100%;
            }

            .mintflip-notification-button:hover {
                background: #1a4d3e;
                color: #ffffff;
            }
        `;
        document.head.appendChild(notifStyle);

        const notification = document.createElement('div');
        notification.className = 'mintflip-notification';

        const header = document.createElement('div');
        header.className = 'mintflip-notification-header';
        header.innerHTML = 'MINT-FLIP WARNING';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'mintflip-notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        };

        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'mintflip-notification-content';

        content.innerHTML = `
            <div class="mintflip-notification-message">
                <strong>Please Go to Your BloxGame Profile</strong><br><br>
                Otherwise <strong>MINT-FLIP</strong> will not work!
            </div>
            <button class="mintflip-notification-button" id="gotoProfile">GO TO PROFILE</button>
        `;

        notification.appendChild(header);
        notification.appendChild(content);
        document.body.appendChild(notification);

        document.getElementById('gotoProfile').addEventListener('click', function() {
            window.location.href = 'https://bloxgame.com/profile';
            
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
})();
