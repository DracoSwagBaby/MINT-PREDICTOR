// Mint-FLIP Notification System
(function() {
    'use strict';

    // Add styles if not already present
    if (!document.getElementById('mintflip-notify-styles')) {
        const style = document.createElement('style');
        style.id = 'mintflip-notify-styles';
        style.textContent = `
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
            }

            .mintflip-notification-message strong {
                color: #48d19d;
                font-weight: 600;
            }

            /* Heartbeat Animation */
            @keyframes persistentHeartbeat {
                0% {
                    transform: scale(1);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 0 rgba(72, 209, 157, 0.7);
                }
                15% {
                    transform: scale(1.08);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 15px rgba(72, 209, 157, 0);
                }
                30% {
                    transform: scale(1);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 0 rgba(72, 209, 157, 0.7);
                }
                45% {
                    transform: scale(1.05);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 10px rgba(72, 209, 157, 0);
                }
                60% {
                    transform: scale(1);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 0 rgba(72, 209, 157, 0.7);
                }
                100% {
                    transform: scale(1);
                    border-color: #48d19d;
                    box-shadow: 0 0 0 0 rgba(72, 209, 157, 0.7);
                }
            }

            .heartbeat-persistent {
                animation: persistentHeartbeat 1.2s ease-in-out infinite !important;
                position: relative;
                z-index: 10000;
            }
        `;
        document.head.appendChild(style);
    }

    // Store active notification reference
    let activeNotification = null;
    let heartbeatObserver = null;

    // Main notification function
    window.showNotification = function(title, message, autoHide = true, duration = 5000) {
        // Remove any existing notification
        const existing = document.querySelector('.mintflip-notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'mintflip-notification';

        // Create header
        const header = document.createElement('div');
        header.className = 'mintflip-notification-header';
        header.innerHTML = title;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mintflip-notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            closeNotification(notification);
        };

        header.appendChild(closeBtn);

        // Create content
        const content = document.createElement('div');
        content.className = 'mintflip-notification-content';
        content.innerHTML = `<div class="mintflip-notification-message">${message}</div>`;

        notification.appendChild(header);
        notification.appendChild(content);
        document.body.appendChild(notification);

        // Store reference
        activeNotification = notification;

        // Auto-hide if enabled
        if (autoHide) {
            setTimeout(() => {
                closeNotification(notification);
            }, duration);
        }

        return notification;
    };

    // Helper to close notification
    function closeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('closing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                if (activeNotification === notification) {
                    activeNotification = null;
                }
            }, 300);
        }
    }

    // Heartbeat function for Start button
    window.startButtonHeartbeat = function() {
        // Clean up previous observer
        if (heartbeatObserver) {
            heartbeatObserver.disconnect();
            heartbeatObserver = null;
        }

        // Find the Start button
        const startButton = document.querySelector('button.button_button__dZRSb.button_primary__LXFHi.gameBetSubmit');
        
        if (startButton) {
            // Add heartbeat class
            startButton.classList.add('heartbeat-persistent');
            
            // Watch for button text changes AND game start
            heartbeatObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        // Check if game started (button text no longer contains "Start" or "Play")
                        if (!startButton.textContent.includes('Start') && !startButton.textContent.includes('Play')) {
                            // Remove heartbeat
                            startButton.classList.remove('heartbeat-persistent');
                            
                            // Close the notification if it's still open
                            if (activeNotification) {
                                closeNotification(activeNotification);
                            }
                            
                            heartbeatObserver.disconnect();
                            heartbeatObserver = null;
                        }
                    }
                });
            });
            
            // Observe text changes
            heartbeatObserver.observe(startButton, {
                childList: true,
                characterData: true,
                subtree: true
            });
            
            return true;
        }
        return false;
    };

    // Pre-made warning for mines round not started
    window.MinesRoundNotStarted = function() {
        // Show notification
        const notif = window.showNotification(
            'MINT-FLIP WARNING',
            '<strong>Please Start The Round So the Predict Works</strong><br><br>Otherwise <strong>MINT-FLIP</strong> will not Predict!',
            false, // No auto-hide
            0
        );
        
        // Start heartbeat on the button
        setTimeout(() => {
            window.startButtonHeartbeat();
        }, 100);
        
        return notif;
    };

})();
