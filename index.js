"use strict";
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
let dropInterval = level(); 

let isGameRunning = false;

context.scale(20, 20);

function level() {
    // Get a reference to the select element
    const selectElement = document.getElementById('level');

    // Get the selected value from the select element
    const selectedValue = selectElement.value;

    // Check the selected value and return a corresponding number
    if (selectedValue === 'hard') {
        return 60;
    } else if (selectedValue === 'normal') {
        return 120;
    } else if (selectedValue === 'easy') {
        return 250;
    } else {
        // Handle other cases or provide a default value
        return 0;
    }
    
}

// Function to create a matrix
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Function to create Tetrimino shapes
function createPiece(type) {
    if (type === "I") {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === "L") {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === "J") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === "O") {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === "Z") {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === "T") {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

// Function to draw a matrix with borders
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = colors[value];
                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineJoin = "round"

                // Add a border
                context.strokeStyle = 'black'; // Change the border color as needed
                context.lineWidth = 0.1; // Adjust the border width as needed
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Function to merge Tetrimino into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Function to rotate a matrix
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach((row) => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Function to check for collisions
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

const colors = [
    null,
    "#ff0d72",
    "#0dc2ff",
    "#0dff72",
    "#f538ff",
    "#ff8e0d",
    "#ffe138",
    "#3877ff",
];

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

let dropCounter = 0;

let lastTime = 0;

let isPaused = false; // Track pause state
let animationId; // Store the animation frame ID

// Function to start/restart the game
// Function to start/restart the game
function startGame() {
        // Initialize game variables and start the game loop
        if (!isGameRunning) {
        playerReset();
        updateScore();
        update();
        pauseButton.disabled = false
        startButton.innerText = "Restart";
        isGameRunning = true;
        

        }
        playerReset();
        updateScore();
        context.clearRect(0, 0, canvas.width, canvas.height);
        arena.forEach((row) => row.fill(0));
        dropInterval = level();
        
         // Change button text to "Restart"
        // Disable the Start/Restart button during gameplay
}

// Event listener for the Start/Restart button
const startButton = document.getElementById("startBtn");
startButton.addEventListener("click", startGame);


// Function to pause/resume the game
function pauseGame() {
    isPaused = !isPaused; // Toggle pause state
    if (isPaused) {
        // Pause the game (stop updating)
        cancelAnimationFrame(animationId);
        pauseButton.innerText = "Resume";
    } else {
        // Resume the game (restart updating)
        update();
        pauseButton.innerText = "Pause";
    }
}

// Event listener for the Pause button
const pauseButton = document.getElementById("pauseBtn");
pauseButton.addEventListener("click", pauseGame);

// Event listener for the Stop button
const stopButton = document.getElementById("stopBtn");
stopButton.addEventListener("click",stopGame);
    // Clear the canvas
function stopGame(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the arena
    arena.forEach((row) => row.fill(0));

    // Reset the player
    playerReset();

    // Update the score (set to 0)
    player.score = 0;
    updateScore();

    // Disable the Pause button
    pauseButton.disabled = true;
    
    // Enable the Start button
    isGameRunning = false; // Set the game as not running
    
    startButton.innerHTML = "Start Game"
    pauseButton.innerHTML = "Pause"
    pauseButton.disabled = true
    isPaused = false

    
    // Stop the game loop
    cancelAnimationFrame(animationId);
}

// Function to reset the player
function playerReset() {
    const pieces = "TJLOSZI";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
        arena.forEach((row) => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Function to update the player's score on the web page
function updateScore() {
    document.getElementById("score").innerText = "Score: " + player.score;
}

// Event listener for keyboard input
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

// Function to start the game loop
function update(time = 0) {
    if (!isPaused) {
        const deltaTime = time - lastTime;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        lastTime = time;
        draw();
    }

    animationId = requestAnimationFrame(update);
}

// Function to move the player horizontally
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

// Function to drop the player's Tetrimino
function playerDrop() {
    
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        if (player.pos.y <= 1) {
            // Game over condition
            gameOver();
            return;
        }
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}



function gameOver() {
    stopGame()
    alert('Game Over! Your score: ' + player.score);
    location.reload();

// To refresh the page after a specified time (in milliseconds):
    setTimeout(function() {
    location.reload();
    }, 1000) // Stop the game loop
    // You can also reset the game state or perform any other actions as needed
}

// Function to rotate the player's Tetrimino
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Function to handle clearing completed rows
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// Function to draw the game state
function draw() {
    context.fillStyle = "#F5F5F5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Start the game when the page loads
