// Mobile-first birthday app functionality
class BirthdayApp {
    constructor() {
        this.isPlaying = false;
        this.confettiActive = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createInitialConfetti();
        this.optimizeForMobile();
    }

    setupEventListeners() {
        // Candle blowing with touch support
        const candles = document.querySelectorAll('.candle');
        candles.forEach(candle => {
            // Support both click and touch events
            candle.addEventListener('click', (e) => this.blowCandle(e.target));
            candle.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double tap zoom
                this.blowCandle(e.target);
            });
        });

        // Balloon interaction with haptic feedback
        const balloons = document.querySelectorAll('.balloon');
        balloons.forEach(balloon => {
            balloon.addEventListener('click', () => this.popBalloon(balloon));
            balloon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.popBalloon(balloon);
            });
        });

        // Modal close handlers
        const modal = document.getElementById('surprise-modal');
        const closeBtn = document.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSurprise());
            closeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.closeSurprise();
            });
        }

        // Close modal on backdrop click/touch
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeSurprise();
            });

            // Prevent modal content clicks from closing modal
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }

        // Swipe gesture for modal close (mobile-friendly)
        this.setupSwipeGestures(modal);
    }

    blowCandle(candle) {
        if (!candle.classList.contains('blown-out')) {
            candle.classList.add('blown-out');
            this.addHapticFeedback();
            this.createPuffEffect(candle);

            // Check if all candles are blown out
            const remainingCandles = document.querySelectorAll('.candle:not(.blown-out)');
            if (remainingCandles.length === 0) {
                setTimeout(() => this.showSurprise(), 1000);
            }
        }
    }

    popBalloon(balloon) {
        if (!balloon.classList.contains('popped')) {
            balloon.classList.add('popped');
            balloon.style.transform = 'scale(0)';
            balloon.style.opacity = '0';
            this.addHapticFeedback();
            this.createPopEffect(balloon);

            setTimeout(() => {
                balloon.style.display = 'none';
            }, 300);
        }
    }

    launchConfetti() {
        if (this.confettiActive) return;

        this.confettiActive = true;
        const container = document.getElementById('confetti-container');

        // Lanza mucho más confeti en ráfagas
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 80; i++) {
                    setTimeout(() => this.createConfettiPiece(container), i * 20);
                }
            }, burst * 500);
        }

        // Crear confeti especial con emojis
        for (let i = 0; i < 15; i++) {
            setTimeout(() => this.createEmojiConfetti(container), i * 200);
        }

        this.addHapticFeedback();
        setTimeout(() => {
            this.confettiActive = false;
        }, 5000);
    }

    createConfettiPiece(container) {
        const colors = ['#ff6b9d', '#a8e6cf', '#ffd93d', '#ff9a9e', '#7fcdcd', '#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#98FB98'];
        const shapes = ['square', 'circle', 'triangle', 'star', 'heart'];
        const confetti = document.createElement('div');

        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.className = `confetti-piece confetti-${shape}`;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';

        // Añadir rotación aleatoria
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        container.appendChild(confetti);

        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }

    createEmojiConfetti(container) {
        const emojis = ['🎉', '🎊', '🎈', '🎂', '✨', '⭐', '💖', '🌟', '🦄', '🍰', '🎀', '💕'];
        const emojiPiece = document.createElement('div');

        emojiPiece.className = 'confetti-emoji';
        emojiPiece.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
        emojiPiece.style.left = Math.random() * 100 + '%';
        emojiPiece.style.fontSize = (Math.random() * 20 + 20) + 'px';
        emojiPiece.style.animationDelay = Math.random() * 0.5 + 's';
        emojiPiece.style.animationDuration = (Math.random() * 3 + 4) + 's';

        container.appendChild(emojiPiece);

        setTimeout(() => {
            if (emojiPiece.parentNode) {
                emojiPiece.parentNode.removeChild(emojiPiece);
            }
        }, 6000);
    }

    createInitialConfetti() {
        // No confetti on page load - only when button is pressed
        // setTimeout(() => this.launchConfetti(), 2000);
    }

    toggleMusic() {
        const audio = document.getElementById('birthday-music');
        const musicBtn = document.querySelector('.music-btn');

        if (!audio) {
            // Create a simple audio context for mobile-friendly music
            this.playSimpleMusic(musicBtn);
            return;
        }

        if (this.isPlaying) {
            audio.pause();
            musicBtn.textContent = '🎵 Música';
            this.isPlaying = false;
        } else {
            audio.play().catch(() => {
                // Fallback for autoplay restrictions
                this.playSimpleMusic(musicBtn);
            });
            musicBtn.textContent = '⏸️ Pausar';
            this.isPlaying = true;
        }

        this.addHapticFeedback();
    }

    playSimpleMusic(button) {
        // Simple Web Audio API melody for mobile compatibility
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const notes = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
        let noteIndex = 0;

        const playNote = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = notes[noteIndex % notes.length];
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);

            noteIndex++;
            if (noteIndex < 8) {
                setTimeout(playNote, 300);
            }
        };

        playNote();
        button.textContent = '🎵 ¡Tocando!';
        setTimeout(() => {
            button.textContent = '🎵 Música';
        }, 2500);
    }

    showSurprise() {
        const modal = document.getElementById('surprise-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            this.animateWishes();
            this.addHapticFeedback();
            this.launchConfetti();
        }
    }

    closeSurprise() {
        const modal = document.getElementById('surprise-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scroll
        }
    }

    animateWishes() {
        const wishes = document.querySelectorAll('.wish');
        wishes.forEach((wish, index) => {
            wish.style.animationDelay = (index * 0.2) + 's';
            wish.style.opacity = '0';
            wish.style.animation = 'fadeInUp 0.5s ease forwards';
        });
    }

    createPuffEffect(candle) {
        const puff = document.createElement('div');
        puff.innerHTML = '💨';
        puff.style.position = 'absolute';
        puff.style.fontSize = '1.5rem';
        puff.style.pointerEvents = 'none';
        puff.style.animation = 'puffUp 1s ease-out forwards';

        const rect = candle.getBoundingClientRect();
        puff.style.left = rect.left + 'px';
        puff.style.top = (rect.top - 20) + 'px';

        document.body.appendChild(puff);

        setTimeout(() => {
            if (puff.parentNode) {
                puff.parentNode.removeChild(puff);
            }
        }, 1000);
    }

    createPopEffect(balloon) {
        const pop = document.createElement('div');
        pop.innerHTML = '💥';
        pop.style.position = 'absolute';
        pop.style.fontSize = '2rem';
        pop.style.pointerEvents = 'none';
        pop.style.animation = 'popEffect 0.5s ease-out forwards';

        const rect = balloon.getBoundingClientRect();
        pop.style.left = rect.left + 'px';
        pop.style.top = rect.top + 'px';

        document.body.appendChild(pop);

        setTimeout(() => {
            if (pop.parentNode) {
                pop.parentNode.removeChild(pop);
            }
        }, 500);
    }

    addHapticFeedback() {
        // Haptic feedback for mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    setupSwipeGestures(modal) {
        if (!modal) return;

        let startY = 0;
        let startX = 0;

        modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });

        modal.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;

            // Swipe down to close
            if (diffY < -100 && Math.abs(diffX) < 100) {
                this.closeSurprise();
            }
        });
    }

    optimizeForMobile() {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        // Optimize viewport
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    startCharacterParty() {
        const characters = document.querySelectorAll('.character');
        const giftBox = document.querySelector('.animated-gift-box');

        // Make characters dance
        characters.forEach((character, index) => {
            character.classList.add('dancing');

            // Change speech bubbles during party
            const bubble = character.querySelector('.speech-bubble');
            const partyMessages = [
                '¡Viva Nicoll! 🎉',
                '¡Soy la reina del día! 👑',
                '¡Celebren conmigo! 💃'
            ];

            setTimeout(() => {
                bubble.textContent = partyMessages[index % partyMessages.length];
                bubble.style.animation = 'bubbleAppear 0.5s ease forwards';
            }, index * 200);
        });

        // Animate gift box
        if (giftBox) {
            giftBox.style.animation = 'bounce 0.6s ease infinite';
        }

        // Launch confetti during party
        this.launchConfetti();
        this.addHapticFeedback();

        // Stop party after 5 seconds
        setTimeout(() => {
            characters.forEach(character => {
                character.classList.remove('dancing');
            });
            if (giftBox) {
                giftBox.style.animation = '';
            }
        }, 5000);
    }

    showMoreWishes() {
        const wishesContainer = document.querySelector('.wishes-container');
        if (!wishesContainer) return;

        const extraWishes = [
            '🎨 Que la creatividad inspire cada día',
            '🌺 Que florezcan nuevas oportunidades',
            '🎪 Que la vida sea una aventura divertida',
            '🌙 Que tus noches sean de dulces sueños',
            '🦄 Que la magia te acompañe siempre',
            '🌈 Que después de cada tormenta veas el arcoíris'
        ];

        // Remove existing extra wishes
        const existingExtra = wishesContainer.querySelectorAll('.extra-wish');
        existingExtra.forEach(wish => wish.remove());

        // Add new random wishes
        const shuffled = extraWishes.sort(() => 0.5 - Math.random());
        const selectedWishes = shuffled.slice(0, 3);

        selectedWishes.forEach((wishText, index) => {
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card extra-wish';
            wishCard.textContent = wishText;
            wishCard.style.animationDelay = (index * 0.2) + 's';

            // Add gradient background
            const gradients = [
                'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
                'linear-gradient(45deg, #ffd93d, #ff9a9e)',
                'linear-gradient(45deg, #d299c2, #fef9d7)'
            ];
            wishCard.style.background = gradients[index % gradients.length];
            wishCard.style.color = 'white';

            wishesContainer.appendChild(wishCard);
        });

        // Create sparkle effect
        this.createSparkleEffect();
        this.addHapticFeedback();
    }

    createSparkleEffect() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.fontSize = Math.random() * 1 + 0.5 + 'rem';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animation = `sparkleFloat ${Math.random() * 2 + 1}s ease-out forwards`;
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '10';

            modal.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
        }
    }
}

// Global functions for button onclick handlers
function launchConfetti() {
    window.birthdayApp.launchConfetti();
}

function toggleMusic() {
    window.birthdayApp.toggleMusic();
}

function showSurprise() {
    window.birthdayApp.showSurprise();
}

function closeSurprise() {
    window.birthdayApp.closeSurprise();
}

function startCharacterParty() {
    window.birthdayApp.startCharacterParty();
}

function showMoreWishes() {
    window.birthdayApp.showMoreWishes();
}

// Additional CSS animations for effects
const additionalStyles = `
@keyframes puffUp {
    0% { transform: scale(0) translateY(0); opacity: 1; }
    100% { transform: scale(2) translateY(-50px); opacity: 0; }
}

@keyframes popEffect {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.5); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
}

@keyframes sparkleFloat {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0) rotate(0deg);
    }
    50% {
        opacity: 1;
        transform: translateY(-30px) scale(1) rotate(180deg);
    }
    100% {
        opacity: 0;
        transform: translateY(-60px) scale(0.5) rotate(360deg);
    }
}

.balloon.popped {
    transition: all 0.3s ease;
}

.candle.blown-out::before {
    opacity: 0.3;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.birthdayApp = new BirthdayApp();
    });
} else {
    window.birthdayApp = new BirthdayApp();
}