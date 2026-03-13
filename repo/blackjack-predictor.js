// blackjack-predictor.js - Complete Blackjack AI with all features
(function() {
    'use strict';
    
    
    // ============================================
    // STATE
    // ============================================
    let lastYourHand = '';
    let lastBotHand = '';
    let yourHandElement = null;
    let botHandElement = null;
    let aiSelfPlayEnabled = false;
    let aiInterval = null;
    
    // ============================================
    // FIND YOUR HAND (bottom player, no hidden class)
    // ============================================
    function findYourHand() {
        const container = document.querySelector('.hand-value_container__Bj9hW:not(.hand-value_hidden__Pe87M)');
        if (container) {
            return container.querySelector('.hand-value_value__FZydR');
        }
        return null;
    }

    // Check if you lost
    function didYouLose() {
        const yourHandElement = findYourHand();
        if (yourHandElement) {
            // Check for lose class on the hand value element
            if (yourHandElement.classList.contains('hand-value_handStateLose__dmDZj')) {
                return true;
            }
            // Also check if parent container has lose state
            const container = yourHandElement.closest('.hand-value_container__Bj9hW');
            if (container && container.querySelector('.hand-value_handStateLose__dmDZj')) {
                return true;
            }
        }
        return false;
    }
    
    // Find BOT HAND (top player, WITH hidden class)
    function findBotHand() {
        const container = document.querySelector('.hand-value_container__Bj9hW.hand-value_hidden__Pe87M');
        if (container) {
            return container.querySelector('.hand-value_value__FZydR');
        }
        return null;
    }
    
    // ============================================
    // BUTTON FINDERS
    // ============================================
    function findStartButton() {
        // Try multiple selectors to catch both Play and Start new game buttons
        const selectors = [
            'button.button_button__dZRSb.button_primary__LXFHi.gameBetSubmit',
            'button.button_primary__LXFHi.gameBetSubmit',
            '.gameBetActionsContainer button',
            'button[style*="flex: 0 0 80%"]', // For Start new game button
            'button[style*="flex: 0 0 100%"]'  // For Play button
        ];
        
        for (const selector of selectors) {
            const btn = document.querySelector(selector);
            if (btn && (btn.textContent.includes('Start') || btn.textContent.includes('Play'))) {
                return btn;
            }
        }
        
        // Last resort: search all buttons
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            if (btn.textContent.includes('Start new game') || btn.textContent.includes('Play')) {
                return btn;
            }
        }
        
        return null;
    }

    // Find Insurance button (the one that opens the option)
    function findInsuranceButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const span = btn.querySelector('span.text_text__fMaR4 span');
            if (span && span.textContent === 'Insurance') {
                return btn;
            }
            // Alternative check
            if (btn.textContent.includes('Insurance')) {
                return btn;
            }
        }
        return null;
    }

    // Find Decline button (appears after clicking Insurance)
    function findDeclineButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const span = btn.querySelector('span.text_text__fMaR4');
            if (span && span.textContent === 'Decline') {
                return btn;
            }
            // Check by class
            if (btn.classList.contains('insurance_button__oszp5')) {
                return btn;
            }
        }
        return null;
    }

    // Click Insurance then Decline
    function handleInsurance() {
        // First check if Decline is already there
        const declineBtn = findDeclineButton();
        if (declineBtn && !declineBtn.disabled) {
            declineBtn.click();
            return true;
        }
        
        // If no Decline button, click Insurance to open options
        const insuranceBtn = findInsuranceButton();
        if (insuranceBtn && !insuranceBtn.disabled) {
            insuranceBtn.click();
            
            // Wait a moment then click Decline
            setTimeout(() => {
                const declineNow = findDeclineButton();
                if (declineNow && !declineNow.disabled) {
                    declineNow.click();
                }
            }, 100);
            return true;
        }
        
        return false;
    }

    function findHitButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const span = btn.querySelector('span.text_text__fMaR4');
            if (span && span.textContent === 'Hit') {
                return btn;
            }
        }
        return null;
    }
    
    function findStandButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const span = btn.querySelector('span.text_text__fMaR4');
            if (span && span.textContent === 'Stand') {
                return btn;
            }
        }
        return null;
    }
    
    function findDoubleButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const span = btn.querySelector('span.text_text__fMaR4');
            if (span && span.textContent === 'Double') {
                return btn;
            }
        }
        return null;
    }

    // ============================================
    // CLICK FUNCTIONS
    // ============================================
    function clickStartButton() {
        const btn = findStartButton();
        if (btn && !btn.disabled) {
            btn.click();
            return true;
        }
        return false;
    }

    function clickDeclineButton() {
        const btn = findDeclineButton();
        if (btn && !btn.disabled) {
            btn.click();
            return true;
        }
        return false;
    }

    function clickHitButton() {
        const btn = findHitButton();
        if (btn && !btn.disabled) {
            btn.click();
            return true;
        }
        return false;
    }

    function clickStandButton() {
        const btn = findStandButton();
        if (btn && !btn.disabled) {
            btn.click();
            return true;
        }
        return false;
    }

    function clickDoubleButton() {
        const btn = findDoubleButton();
        if (btn && !btn.disabled) {
            btn.click();
            return true;
        }
        return false;
    }
    
    // ============================================
    // ADVANCED BLACKJACK STRATEGY WITH BUST PREDICTION
    // ============================================
    function getBlackjackAction(playerValue, dealerValue) {
        const p = parseInt(playerValue);
        const d = parseInt(dealerValue);
        
        if (isNaN(p) || isNaN(d)) return 'WAIT';
        if (p > 21) return 'BUST';
        if (p === 21) return 'STAND';
        
        // Calculate bust probability if you hit
        function getBustProbability(hand) {
            // Cards that would bust you (value > 21 - hand)
            const bustCards = [];
            for (let card = 2; card <= 11; card++) {
                if (hand + card > 21) {
                    bustCards.push(card);
                }
            }
            // Probability = number of bust cards / 13 possible card values (2-10,J,Q,K,A)
            return bustCards.length / 13;
        }
        
        const bustProb = getBustProbability(p);
        
        // If bust probability is high (> 50%), consider standing
        if (bustProb > 0.5) {
            
            // But if dealer has strong card, might need to risk
            if (d >= 7 && p <= 15) {
                return 'HIT';
            }
            return 'STAND';
        }
        
        // Normal strategy for low bust risk
        if (p >= 17) return 'STAND';
        if (p >= 13 && p <= 16 && d <= 6) return 'STAND';
        if (p >= 13 && p <= 16 && d >= 7) return 'HIT';
        if (p === 12 && d >= 4 && d <= 6) return 'STAND';
        if (p === 12) return 'HIT';
        if (p === 11) return 'DOUBLE';
        if (p === 10 && d <= 9) return 'DOUBLE';
        if (p === 9 && d >= 3 && d <= 6) return 'DOUBLE';
        if (p <= 8) return 'HIT';
        
        return 'HIT';
    }
    
    // ============================================
    // AI DECISION MAKING
    // ============================================
    function makeAIDecision() {
        if (!aiSelfPlayEnabled) return;
        
        // Handle insurance first
        if (handleInsurance()) {
            return; // Insurance was handled, wait for next cycle
        }

        // Check for insurance offer first
        if (clickDeclineButton()) {
            return;
        }
        
        // Check if you lost (hand has lose class)
        if (didYouLose()) {
            const startBtn = findStartButton();
            if (startBtn) {
                startBtn.click();
            }
            return;
        }
        
        const yourHand = document.getElementById('blackjack-your-hand')?.textContent || '0';
        const botHand = document.getElementById('blackjack-bot-hand')?.textContent || '0';
        
        const yourNum = parseInt(yourHand);
        const botNum = parseInt(botHand);
        
        // Store current state to detect stuck loops
        if (!window.lastHandState) {
            window.lastHandState = { your: yourNum, bot: botNum, time: Date.now() };
        }
        
        // Check if same hand values for more than 2 seconds (stuck)
        if (window.lastHandState.your === yourNum && 
            window.lastHandState.bot === botNum && 
            Date.now() - window.lastHandState.time > 2000) {
            const startBtn = findStartButton();
            if (startBtn) {
                startBtn.click();
            }
            window.lastHandState = { your: yourNum, bot: botNum, time: Date.now() };
            return;
        }
        
        // Update last hand state if values changed
        if (window.lastHandState.your !== yourNum || window.lastHandState.bot !== botNum) {
            window.lastHandState = { your: yourNum, bot: botNum, time: Date.now() };
        }
        
        // If dealer has 24, that means dealer bust or round is over - restart
        if (botNum >= 22) {
            const startBtn = findStartButton();
            if (startBtn) {
                startBtn.click();
            }
            return;
        }
        
        // Check if bust (yourNum > 21)
        if (yourNum > 21) {
            const startBtn = findStartButton();
            if (startBtn) {
                startBtn.click();
            }
            return;
        }
        
        // Auto start game if no hand
        if (yourNum === 0) {
            const startBtn = findStartButton();
            if (startBtn) {
                startBtn.click();
            }
            return;
        }
        
        if (isNaN(yourNum)) return;
        
        if (yourNum === 21) {
            const standBtn = findStandButton();
            if (standBtn) standBtn.click();
            return;
        }
        
        const action = getBlackjackAction(yourNum, botNum);
        
        switch(action) {
            case 'HIT':
                const hitBtn = findHitButton();
                if (hitBtn) hitBtn.click();
                break;
            case 'STAND':
                const standBtn = findStandButton();
                if (standBtn) standBtn.click();
                break;
            case 'DOUBLE':
                const doubleBtn = findDoubleButton();
                if (doubleBtn) doubleBtn.click();
                break;
        }
    }
    
    // ============================================
    // TOGGLE FUNCTION
    // ============================================
    function toggleAISelfPlay() {
        aiSelfPlayEnabled = !aiSelfPlayEnabled;
        
        const btn = document.getElementById('blackjack-ai-selfplay');
        if (btn) {
            btn.textContent = aiSelfPlayEnabled ? 'AI SELF PLAY: ON' : 'AI SELF PLAY: OFF';
            btn.classList.toggle('active', aiSelfPlayEnabled);
        }
        
        if (aiSelfPlayEnabled) {
            if (!aiInterval) {
                aiInterval = setInterval(() => {
                    if (aiSelfPlayEnabled) {
                        makeAIDecision();
                    }
                }, 1000);
            }
        } else {
            if (aiInterval) {
                clearInterval(aiInterval);
                aiInterval = null;
            }
        }
    }
    
    // ============================================
    // UI UPDATE FUNCTIONS
    // ============================================
    function updateColors(yourValue, botValue) {
        const yourUI = document.getElementById('blackjack-your-hand');
        const botUI = document.getElementById('blackjack-bot-hand');
        const yourContainer = document.getElementById('your-hand-container');
        const botContainer = document.getElementById('bot-hand-container');
        
        if (!yourUI || !botUI) return;
        
        const yourNum = parseInt(yourValue);
        const botNum = parseInt(botValue);
        
        if (!isNaN(yourNum) && !isNaN(botNum)) {
            if (yourNum > botNum) {
                yourUI.style.color = '#00ff00';
                yourUI.style.textShadow = '0 0 10px rgba(0,255,0,0.5)';
                botUI.style.color = '#ff6b6b';
                botUI.style.textShadow = 'none';
                if (yourContainer) yourContainer.style.borderColor = '#00ff00';
                if (botContainer) botContainer.style.borderColor = '#ff6b6b';
            } else if (botNum > yourNum) {
                yourUI.style.color = '#ff6b6b';
                yourUI.style.textShadow = 'none';
                botUI.style.color = '#00ff00';
                botUI.style.textShadow = '0 0 10px rgba(0,255,0,0.5)';
                if (yourContainer) yourContainer.style.borderColor = '#ff6b6b';
                if (botContainer) botContainer.style.borderColor = '#00ff00';
            } else {
                yourUI.style.color = '#48d19d';
                botUI.style.color = '#48d19d';
                yourUI.style.textShadow = '0 0 10px rgba(72,209,157,0.5)';
                botUI.style.textShadow = '0 0 10px rgba(72,209,157,0.5)';
                if (yourContainer) yourContainer.style.borderColor = '#48d19d';
                if (botContainer) botContainer.style.borderColor = '#48d19d';
            }
        }
    }
    
    function updateBlackjackHands() {
        // Find YOUR HAND
        if (!yourHandElement || !document.body.contains(yourHandElement)) {
            yourHandElement = findYourHand();
        }
        
        // Find BOT HAND
        if (!botHandElement || !document.body.contains(botHandElement)) {
            botHandElement = findBotHand();
        }
        
        let yourValue = '0';
        let botValue = '0';
        
        // Update YOUR HAND in UI
        if (yourHandElement && document.body.contains(yourHandElement)) {
            yourValue = yourHandElement.textContent.trim();
            
            const yourHandUI = document.getElementById('blackjack-your-hand');
            if (yourHandUI) {
                yourHandUI.textContent = yourValue;
                
                if (yourValue !== lastYourHand && yourValue.match(/^\d+$/)) {
                    lastYourHand = yourValue;
                }
            }
        }
        
        // Update BOT HAND in UI
        if (botHandElement && document.body.contains(botHandElement)) {
            botValue = botHandElement.textContent.trim();
            
            const botHandUI = document.getElementById('blackjack-bot-hand');
            if (botHandUI) {
                botHandUI.textContent = botValue;
                
                if (botValue !== lastBotHand && botValue.match(/^\d+$/)) {
                    lastBotHand = botValue;
                }
            }
        }
        
        // Update colors based on comparison
        updateColors(yourValue, botValue);
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    // Check every 100ms for hand updates
    setInterval(updateBlackjackHands, 100);
    
    // Watch for DOM changes
    const observer = new MutationObserver(() => {
        if (!yourHandElement || !document.body.contains(yourHandElement)) {
            yourHandElement = findYourHand();
        }
        if (!botHandElement || !document.body.contains(botHandElement)) {
            botHandElement = findBotHand();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expose toggle function globally for the button
        window.blackjackToggleAISelfPlay = toggleAISelfPlay;
        window.toggleBlackjackAI = toggleAISelfPlay; // Add this line for compatibility

})();
