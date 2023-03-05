import { memory } from "game-of-life/game_of_life_bg"
import { Universe } from "game-of-life";

// How to draw each cell.
const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct and get universe data.
const universe = Universe.new_random();
const width = universe.width();
const height = universe.height();

// Get element.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

// Null if is running.
let animationId = null;

const renderLoop = () => {
  // Calculate FPS.
  fps.render();

  universe.tick();
  drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
};

const getIndex = (row, column) => {
  return row * width + column;
};

// Draw the grid which simple just lines criss-cross.
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
	ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
	ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
	ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
	ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

// Check if bit in bitmap is set.
const bitIsSet = (n, arr) => {
  // Wasm return an array of u32.
  const byte = Math.floor(n / 8);
  const mask = 1 << (n % 8);
  return (arr[byte] & mask) === mask;
};


// Access wasm linear memory and construct as Uint8Array.
const drawCells = () => {
  const cellsPtr = universe.cells();
  // Wasm return bitmap as array of u32.
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height / 8);

  ctx.beginPath();

  // Two pass for draw
  // since change fillStyle is expensive.

  // Draw alive cell.
  ctx.fillStyle = ALIVE_COLOR;
  for (let row = 0; row < height; row++) {
	for (let col = 0; col < width; col++) {
	  const idx = getIndex(row, col);
	  if (!bitIsSet(idx, cells)) {
		continue;
	  }

	  // Fill cell color.
	  ctx.fillRect(
		col * (CELL_SIZE + 1) + 1,
		row * (CELL_SIZE + 1) + 1,
		CELL_SIZE,
		CELL_SIZE,
	  );
	}
  }

  // Draw dead cell.
  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
	for (let col = 0; col < width; col++) {
	  const idx = getIndex(row, col);
	  if (bitIsSet(idx, cells)) {
		continue;
	  }

	  // Fill cell color.
	  ctx.fillRect(
		col * (CELL_SIZE + 1) + 1,
		row * (CELL_SIZE + 1) + 1,
		CELL_SIZE,
		CELL_SIZE,
	  );
	}
  }

  ctx.stroke();
};

const isPause = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
}

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};


playPauseButton.addEventListener("click", event = () => {
  if (isPause()) {
	play();
  } else {
	pause();
  }
});

canvas.addEventListener("click", event => {
  const boundingRact = canvas.getBoundingClientRect();

  // Translate page-relative to canvas-relative.
  const scaleX = canvas.width / boundingRact.width;
  const scaleY = canvas.height / boundingRact.height;

  const canvasLeft = (event.clientX - boundingRact.left) * scaleX;
  const canvasTop = (event.clientY - boundingRact.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

const fps = new class {
  // Constructor of fps object and
  // record a initial timestamp.
  constructor() {
	this.fps = document.getElementById("fps");
	this.frames = [];
	this.lastFrameTimeStamp = performance.now();
  }

  // Calculate and render FPS data
  render() {
	// Compute fps by delta time.
	const now = performance.now();
	const delta = now - this.lastFrameTimeStamp;
	this.lastFrameTimeStamp = now;
	const fps = 1 / delta * 1000;

	// Save only 100 timings
	// to calculate max, min and mean.
	this.frames.push(fps);
	if (this.frames.length > 100) {
	  this.frames.shift();
	}

	let min = Infinity;
	let max = -Infinity;
	let sum = 0;
	for (let i = 0; i < this.frames.length; i++) {
	  sum += this.frames[i];
	  min = Math.min(this.frames[i], min);
	  max = Math.max(this.frames[i], max);
	}
	let mean = sum / this.frames.length;

	this.fps.textContent = `
Frame per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
	`.trim();
  }
}

// Start draw
play();
