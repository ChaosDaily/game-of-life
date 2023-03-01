import { memory } from "game-of-life/game_of_life_bg"
import { Universe, Cell } from "game-of-life";

// How to draw each cell
const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct and get universe data
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Get element 
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const renderLoop = () => {
  drawGrid();
  drawCells();

  universe.tick();
  requestAnimationFrame(renderLoop);
};

// Draw the grid which simple just lines criss-cross
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

const getIndex = (row, column) => {
  return row * width + column;
};


// Access wasm linear memory and construct as Uint8Array
const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  // Draw each cell
  for (let row = 0; row < height; row++) {
	for (let col = 0; col < width; col++) {
	  const idx = getIndex(row, col);

	  ctx.fillStyle = cells[idx] == Cell.Dead
		? DEAD_COLOR
		: ALIVE_COLOR;

	  // Fill cell color
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

// Start draw
requestAnimationFrame(renderLoop);
