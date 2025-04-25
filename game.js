const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game constants
const DINO_WIDTH = 50;
const DINO_HEIGHT = 50;
const GROUND_HEIGHT = 20;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;
const GRAVITY = 0.4;
const JUMP_FORCE = -16;

// Game state
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let isJumping = false;
let dinoY = 0;
let dinoVelocity = 0;
let obstacles = [];
let lastObstacleTime = 0;
let imagesLoaded = false;
let lastFrameTime = 0;
let animationFrame = 0;

// Load images
const dino = new Image();
const obstacle = new Image();

// Function to set canvas size
function setCanvasSize() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const aspectRatio = 800 / 300;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    dinoY = canvas.height - DINO_HEIGHT - GROUND_HEIGHT;
}

// Function to reset game state
function resetGame() {
    score = 0;
    gameSpeed = 5;
    isGameOver = false;
    isJumping = false;
    obstacles = [];
    dinoY = canvas.height - DINO_HEIGHT - GROUND_HEIGHT;
    dinoVelocity = 0;
    lastObstacleTime = 0;
    animationFrame = 0;
}

// Function to draw with glow effect
function drawWithGlow(image, x, y, width, height) {
    // Draw glow
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.drawImage(image, x, y, width, height);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Load images and start game when they're ready
function loadImages() {
    let imagesToLoad = 2;
    
    dino.onload = function() {
        imagesToLoad--;
        if (imagesToLoad === 0) {
            imagesLoaded = true;
            lastFrameTime = performance.now();
            gameLoop();
        }
    };
    
    obstacle.onload = function() {
        imagesToLoad--;
        if (imagesToLoad === 0) {
            imagesLoaded = true;
            lastFrameTime = performance.now();
            gameLoop();
        }
    };
    
    dino.src = 'rat.gif';
    obstacle.src = 'jjsl.gif';
}

// Game loop
function gameLoop(timestamp) {
    if (!imagesLoaded) return;
    
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    animationFrame = (animationFrame + deltaTime * 0.01) % 100;
    
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = `${canvas.width * 0.04}px Arial`;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillText('Game Over!', canvas.width/2 - canvas.width * 0.1, canvas.height/2);
        ctx.fillText('Score: ' + score, canvas.width/2 - canvas.width * 0.08, canvas.height/2 + canvas.height * 0.1);
        ctx.fillText('Click or press Space to restart', canvas.width/2 - canvas.width * 0.2, canvas.height/2 + canvas.height * 0.2);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground with glow
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(51, 51, 51, 0.8)';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    dinoVelocity += GRAVITY;
    dinoY += dinoVelocity;

    if (dinoY > canvas.height - DINO_HEIGHT - GROUND_HEIGHT) {
        dinoY = canvas.height - DINO_HEIGHT - GROUND_HEIGHT;
        dinoVelocity = 0;
        isJumping = false;
    }

    // Draw dinosaur with glow
    drawWithGlow(dino, canvas.width * 0.05, dinoY, DINO_WIDTH, DINO_HEIGHT);

    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > 2000) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - OBSTACLE_HEIGHT - GROUND_HEIGHT
        });
        lastObstacleTime = currentTime;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        // Draw obstacle with glow
        drawWithGlow(obstacle, obstacles[i].x, obstacles[i].y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);

        if (
            obstacles[i].x < canvas.width * 0.05 + DINO_WIDTH &&
            obstacles[i].x + OBSTACLE_WIDTH > canvas.width * 0.05 &&
            dinoY + DINO_HEIGHT > obstacles[i].y
        ) {
            isGameOver = true;
        }

        if (obstacles[i].x + OBSTACLE_WIDTH < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.1;
        }
    }

    // Draw score with glow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = `${canvas.width * 0.025}px Arial`;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillText('Score: ' + score, canvas.width * 0.02, canvas.height * 0.1);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    requestAnimationFrame(gameLoop);
}

// Event listeners
function jump() {
    if (isGameOver) {
        resetGame();
    } else if (!isJumping) {
        dinoVelocity = JUMP_FORCE;
        isJumping = true;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

canvas.addEventListener('click', jump);

window.addEventListener('resize', () => {
    setCanvasSize();
    resetGame();
});

setCanvasSize();
loadImages(); 