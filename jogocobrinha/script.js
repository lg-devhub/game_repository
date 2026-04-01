const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 32;
const COLS = canvas.width / GRID_SIZE;

let snake = [];
let dx = 1, dy = 0;
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 110;
let gameInterval = null;
let isGameOver = false;
let isPaused = false;

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const modalHighEl = document.getElementById('modalHighScore');

// Imagem da maçã (deixe na pasta img/maca.png)
const appleImg = new Image();
appleImg.src = 'img/maca.png';

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * COLS)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function draw() {
    // Fundo
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a maçã
    ctx.drawImage(appleImg, food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Desenha a cobra (só retângulos coloridos)
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeça - verde mais claro
            ctx.fillStyle = '#00ff88';
        } else if (index % 3 === 0) {
            // Corpo com tom vermelho/laranja para dar contraste
            ctx.fillStyle = '#ff4444';
        } else {
            // Corpo verde normal
            ctx.fillStyle = '#00cc44';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );
    });
}

function update() {
    if (isGameOver || isPaused) return;

    const head = { 
        x: snake[0].x + dx, 
        y: snake[0].y + dy 
    };

    snake.unshift(head);

    // Comeu a maçã?
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;

        // Aumenta velocidade a cada 5 pontos
        if (score % 5 === 0 && gameSpeed > 60) {
            gameSpeed -= 8;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        generateFood();
    } else {
        snake.pop();
    }

    // Colisão com parede ou próprio corpo
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= COLS ||
        snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
        endGame();
    }
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    dx = 1;
    dy = 0;
    score = 0;
    gameSpeed = 110;
    isGameOver = false;
    isPaused = false;

    scoreEl.textContent = '0';
    gameOverScreen.style.display = 'none';

    generateFood();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    highScoreEl.textContent = highScore;
    finalScoreEl.textContent = score;
    modalHighEl.textContent = highScore;
    gameOverScreen.style.display = 'flex';
}

// Controles
document.addEventListener('keydown', e => {
    if (isGameOver) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
        case 'p':
        case 'P':
            isPaused = !isPaused;
            break;
    }
});

document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('restartModal').addEventListener('click', startGame);

// Inicia o jogo
window.onload = () => {
    highScoreEl.textContent = highScore;
    startGame();
};