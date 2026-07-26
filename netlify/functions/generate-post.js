<!TypeDrop html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alphabet Pop - Learn to Type!</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Quicksand', sans-serif;
            overflow: hidden;
            background: #f0f9ff;
            touch-action: manipulation;
        }
        .game-font {
            font-family: 'Fredoka One', cursive;
        }
        .bubble {
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s ease-out;
            cursor: pointer;
            user-select: none;
        }
        .pop-animation {
            animation: pop 0.3s forwards;
        }
        @keyframes pop {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }
        .shake {
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .level-btn {
            transition: all 0.2s ease;
        }
        .level-btn:hover {
            transform: translateY(-4px) scale(1.05);
        }
    </style>
</head>
<body class="h-screen flex flex-col items-center justify-center p-4">

    <!-- HUD -->
    <div class="fixed top-4 left-4 right-4 flex justify-between items-center z-50">
        <div class="bg-white px-6 py-2 rounded-full shadow-lg border-4 border-blue-400">
            <span class="text-2xl font-bold text-blue-600">Score: <span id="score">0</span></span>
        </div>
        <div id="lives-container" class="flex gap-2">
            <!-- Lives icons go here -->
        </div>
    </div>

    <!-- Start Screen -->
    <div id="start-screen" class="text-center z-50 max-w-lg">
        <h1 class="game-font text-6xl text-blue-500 mb-8 drop-shadow-md">Alphabet Pop!</h1>
        <p class="text-xl text-gray-600 mb-8">Choose a level, type the characters on your keyboard to start Popping!</p>
        
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button onclick="startGame('simple')" class="level-btn bg-green-400 text-white game-font text-2xl px-8 py-4 rounded-2xl shadow-xl border-b-8 border-green-600">
                SIMPLE
            </button>
            <button onclick="startGame('medium')" class="level-btn bg-yellow-400 text-white game-font text-2xl px-8 py-4 rounded-2xl shadow-xl border-b-8 border-yellow-600">
                MEDIUM
            </button>
            <button onclick="startGame('hard')" class="level-btn bg-red-400 text-white game-font text-2xl px-8 py-4 rounded-2xl shadow-xl border-b-8 border-red-600">
                HARD
            </button>
        </div>
    </div>

    <!-- Game Over Screen -->
    <div id="game-over" class="hidden text-center z-50">
        <h2 class="game-font text-6xl text-red-500 mb-4">Game Over!</h2>
        <p class="text-2xl text-gray-700 mb-8">You popped <span id="final-score">0</span> letters!</p>
        <button onclick="showStartScreen()" class="bg-blue-500 hover:bg-blue-600 text-white game-font text-3xl px-12 py-4 rounded-full transition-transform transform hover:scale-110 shadow-xl border-b-8 border-blue-700">
            MAIN MENU
        </button>
    </div>

    <!-- Game Area -->
    <div id="game-area" class="fixed inset-0 pointer-events-none"></div>

    <script>
        const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); let score = 0;
 let lives = 5;
 let gameActive = false;
 let spawnRate = 2000;
 let fallSpeed = 2;
 let speedMultiplier = 0.1;
 let bubbles = [];
 let gameLoopReq;
 let spawnInterval;

 const scoreEl = document.getElementById('score');
 const livesContainer = document.getElementById('lives-container');
 const startScreen = document.getElementById('start-screen');
 const gameOverScreen = document.getElementById('game-over');
 const finalScoreEl = document.getElementById('final-score');
 const gameArea = document.getElementById('game-area');

 const DIFFICULTY_SETTINGS = {
 simple: { speed: 1.5, rate: 2500, mult: 0.05 },
 medium: { speed: 2.5, rate: 1800, mult: 0.15 },
 hard: { speed: 4.0, rate: 1000, mult: 0.25 }
 };

 function updateLivesUI() {
 livesContainer.innerHTML = '';
 for (let i = 0; i < 5; i++) {
 const heart = document.createElement('span');
 heart.innerHTML = '❤️';
 heart.style.fontSize = '2rem';
 heart.style.opacity = i < lives ? '1' : '0.2';
 livesContainer.appendChild(heart);
 }
 }

 function createBubble() {
 if (!gameActive) return;

 const char = alphabet[Math.floor(Math.random() * alphabet.length)];
 const color = colors[Math.floor(Math.random() * colors.length)];
 const x = Math.random() * (window.innerWidth - 100) + 50;

 const bubble = document.createElement('div');
 bubble.className = 'bubble game-font';
 bubble.style.backgroundColor = color;
 bubble.style.left = `${x}px`;
 bubble.style.top = '-100px';
 bubble.innerText = char;
 
 gameArea.appendChild(bubble);
 
 bubbles.push({
 element: bubble,
 char: char,
 y: -100,
 speed: fallSpeed + (Math.random() * 0.5)
 });
 }

 function updateGame() {
 if (!gameActive) return;

 for (let i = bubbles.length - 1; i >= 0; i--) {
 const b = bubbles[i];
 b.y += b.speed;
 b.element.style.top = `${b.y}px`;

 if (b.y > window.innerHeight) {
 loseLife();
 gameArea.removeChild(b.element);
 bubbles.splice(i, 1);
 }
 }

 gameLoopReq = requestAnimationFrame(updateGame);
 }

 function loseLife() {
 lives--;
 updateLivesUI();
 document.body.classList.add('shake');
 setTimeout(() => document.body.classList.remove('shake'), 500);

 if (lives <= 0) {
 endGame();
 }
 }

 function handleKeyPress(e) {
 if (!gameActive) return;
 
 const key = e.key.toUpperCase();
 let targetIndex = -1;
 let lowestY = -1;

 for (let i = 0; i < bubbles.length; i++) {
 if (bubbles[i].char === key && bubbles[i].y > lowestY) {
 lowestY = bubbles[i].y;
 targetIndex = i;
 }
 }

 if (targetIndex !== -1) {
 popBubble(targetIndex);
 }
 }

 function popBubble(index) {
 const b = bubbles[index];
 score += 10;
 scoreEl.innerText = score; if (score % 100 === 0) {
 fallSpeed += speedMultiplier;
 if (spawnRate > 500) {
 spawnRate -= 50;
 clearInterval(spawnInterval);
 spawnInterval = setInterval(createBubble, spawnRate);
 }
 }

 b.element.classList.add('pop-animation');
 bubbles.splice(index, 1);
 
 setTimeout(() => {
 if (b.element.parentNode) {
 gameArea.removeChild(b.element);
 }
 }, 300);
 }

 function startGame(difficulty) {
 const settings = DIFFICULTY_SETTINGS[difficulty];
 score = 0;
 lives = 5;
 bubbles = [];
 gameActive = true;
 fallSpeed = settings.speed;
 spawnRate = settings.rate;
 speedMultiplier = settings.mult;
 
 scoreEl.innerText = '0';
 updateLivesUI();
 gameArea.innerHTML = '';
 startScreen.classList.add('hidden');
 gameOverScreen.classList.add('hidden');
 
 updateGame();
 spawnInterval = setInterval(createBubble, spawnRate);
 }

 function showStartScreen() {
 gameOverScreen.classList.add('hidden');
 startScreen.classList.remove('hidden');
 gameArea.innerHTML = '';
 }

 function endGame() {
 gameActive = false;
 cancelAnimationFrame(gameLoopReq);
 clearInterval(spawnInterval);
 finalScoreEl.innerText = score;
 gameOverScreen.classList.remove('hidden');
 }

 window.addEventListener('keydown', handleKeyPress);
 updateLivesUI();
 </script>
</body>
</html>
const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { topic } = JSON.parse(event.body);

        if (!topic) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Topic is required' })
            };
        }

        const prompt = `You are the LinkedIn content strategist for Agmo Junior, creating posts for Sabrina Wong (avatar/spokesperson).

CRITICAL RULES:
1. ALWAYS include #EdTech and #AgmoJunior hashtags in the post
2. Personal anecdotes OK, but DE-PERSONALIZE: Use "I had a friend who..." or "A colleague once told me..." NOT "I taught..." or "I experienced..."
3. Never make specific biographical claims about Sabrina (years, schools, roles)
4. Keep her background vague and flexible

Topic: "${topic}"

Return the content in this EXACT format with NO extra text:

LINKEDIN POST:
[Post text here - 200-400 words, strong hook, story-driven, why it matters, discussion question, MUST include #EdTech #AgmoJunior]

IMAGE GENERATION PROMPTS:
1. [Detailed visual prompt - specific composition, colors, mood]
2. [Detailed visual prompt - specific composition, colors, mood]
3. [Detailed visual prompt - specific composition, colors, mood]

ENGAGEMENT PREDICTION:
HIGH or MEDIUM

DISCUSSION QUESTIONS:
- [Question 1]
- [Question 2]
- [Question 3]`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-1',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const content = data.content[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ content })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};