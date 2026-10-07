const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  boost: false
};

const state = {
  world: { width: 3200, height: 3200 },
  players: [],
  food: [],
  bots: []
};

const ui = {
  name: document.getElementById('nameLabel'),
  score: document.getElementById('scoreLabel'),
  level: document.getElementById('levelLabel')
};

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function updateKeyState(event, value) {
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') keys.up = value;
  if (key === 's' || key === 'arrowdown') keys.down = value;
  if (key === 'a' || key === 'arrowleft') keys.left = value;
  if (key === 'd' || key === 'arrowright') keys.right = value;
  if (key === 'shift') keys.boost = value;
}

window.addEventListener('keydown', (event) => updateKeyState(event, true));
window.addEventListener('keyup', (event) => updateKeyState(event, false));

socket.on('welcome', ({ id, world }) => {
  state.world = world;
  const chosenName = prompt('Choose a name for your creature:', 'Player') || 'Player';
  socket.emit('join', { name: chosenName });
  ui.name.textContent = `Name: ${chosenName}`;
  socket.playerId = id;
});

socket.on('state', (payload) => {
  state.world = payload.world;
  state.players = payload.players || [];
  state.food = payload.food || [];
  state.bots = payload.bots || [];

  const me = state.players.find((player) => player.id === socket.id);
  if (me) {
    ui.score.textContent = `Score: ${Math.floor(me.score)}`;
    ui.level.textContent = `Level: ${me.level}`;
  }
});

setInterval(() => {
  socket.emit('input', keys);
}, 1000 / 30);

function drawGrid(cameraX, cameraY) {
  const spacing = 90;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;

  const startX = Math.floor(cameraX / spacing) * spacing;
  const endX = startX + Math.ceil((window.innerWidth + spacing) / spacing) * spacing;
  const startY = Math.floor(cameraY / spacing) * spacing;
  const endY = startY + Math.ceil((window.innerHeight + spacing) / spacing) * spacing;

  for (let x = startX; x < endX; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x - cameraX, 0);
    ctx.lineTo(x - cameraX, window.innerHeight);
    ctx.stroke();
  }

  for (let y = startY; y < endY; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y - cameraY);
    ctx.lineTo(window.innerWidth, y - cameraY);
    ctx.stroke();
  }
}

function drawFood(cameraX, cameraY) {
  for (const food of state.food) {
    const x = food.x - cameraX;
    const y = food.y - cameraY;

    ctx.beginPath();
    ctx.fillStyle = food.color || '#5ef08d';
    ctx.arc(x, y, food.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBot(bot, cameraX, cameraY) {
  const x = bot.x - cameraX;
  const y = bot.y - cameraY;
  ctx.beginPath();
  ctx.fillStyle = bot.type === 'predator' ? '#ff7b7b' : '#8fb3ff';
  ctx.arc(x, y, bot.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.arc(x, y, bot.radius + 5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlayer(player, cameraX, cameraY) {
  const x = player.x - cameraX;
  const y = player.y - cameraY;

  const isMe = player.id === socket.id;
  ctx.beginPath();
  ctx.fillStyle = isMe ? '#fff7a8' : '#5ad1ff';
  ctx.arc(x, y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = isMe ? '#ffffff' : '#0d1321';
  ctx.lineWidth = isMe ? 3 : 2;
  ctx.arc(x, y, player.radius + 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(player.name, x, y - player.radius - 12);
}

function drawWorld() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const me = state.players.find((player) => player.id === socket.id);
  const cameraX = me ? me.x - window.innerWidth / 2 : 0;
  const cameraY = me ? me.y - window.innerHeight / 2 : 0;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  ctx.fillStyle = '#0d1321';
  ctx.fillRect(0, 0, state.world.width, state.world.height);

  for (let x = 0; x <= state.world.width; x += 90) {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.world.height);
    ctx.stroke();
  }

  for (let y = 0; y <= state.world.height; y += 90) {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.world.width, y);
    ctx.stroke();
  }

  for (const food of state.food) {
    ctx.beginPath();
    ctx.fillStyle = '#5ef08d';
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const bot of state.bots) {
    ctx.beginPath();
    ctx.fillStyle = bot.type === 'predator' ? '#ff7b7b' : '#8fb3ff';
    ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const player of state.players) {
    const isMe = player.id === socket.id;
    ctx.beginPath();
    ctx.fillStyle = isMe ? '#fff7a8' : '#5ad1ff';
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#0d1321';
    ctx.lineWidth = isMe ? 3 : 2;
    ctx.arc(player.x, player.y, player.radius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - player.radius - 12);
  }

  ctx.restore();
}

function animate() {
  drawWorld();
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
