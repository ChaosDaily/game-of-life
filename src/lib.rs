mod utils;

use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::console;
use js_sys::Math;
use fixedbitset::FixedBitSet;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

impl Universe {
    /// Helper function to get index of cell.
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    /// Count how many neighbor alive.
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        // Modulo to cycle.
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                // Skip current cell itself.
                if delta_col == 0 && delta_row == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    /// Get all cells.
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    /// Set cells to be alive by passing (row, column).
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells.set(idx, true);
        }
    }
}

// methods exported to JS.
#[wasm_bindgen]
impl Universe {
    /// Initializes with fixed pattern.
    pub fn new() -> Universe {
        let width = 64;
        let height = 64;

        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);
        for bit in 0..size {
            cells.set(bit, bit % 2 == 0 || bit % 7 == 0);
        }

        Universe {
            width,
            height,
            cells,
        }
    }

    /// Initializes with random pattern.
    pub fn new_random(width: u32, height: u32) -> Universe {
        let size = (width * height) as usize;

        let mut cells = FixedBitSet::with_capacity(size);
        for bit in 0..size {
            cells.set(bit, Math::random() < 0.5);
        }

        Universe {
            width,
            height,
            cells,
        }
    }

    /// Initializes with empty pattern.
    pub fn empty() -> Universe {
        let width = 64;
        let height = 64;

        let size = (width * height) as usize;
        let cells = FixedBitSet::with_capacity(size);

        Universe {
            width,
            height,
            cells,
        }
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn tick(&mut self) {
        let _timer = Timer::new("Universe::tick");
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = match (cell, live_neighbors) {
                    // Rule: alive cell dies if neighbors fewer than 2.
                    (true, x) if x < 2 => false,
                    // Rule: alive cell keep alive when neighbors is 2 or 3.
                    (true, 2) | (true, 3) => true,
                    // Rule: alive cell dies if neighbors more than 3.
                    (true, x) if x > 3 => false,
                    // Rule: dead cell reborn when neighbors is 3.
                    (false, 3) => true,
                    // Remain the same.
                    (otherwise, _) => otherwise,
                };

                next.set(idx, next_cell);
            }
        }
        self.cells = next;
    }

    /// Set width and set all cells to dead.
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = FixedBitSet::with_capacity((self.width * self.height) as usize);
    }

    /// Set height and set all cells to dead.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = FixedBitSet::with_capacity((self.width * self.height) as usize);
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells.toggle(idx);
    }

    /// Draw a glider centered on (row, col).
    pub fn draw_glider(&mut self, row: u32, column: u32) {
        // Cells list that should set to alive.
        let mut cells = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)];
        let left = (column + self.width - 1) % self.width;
        let top = (row + self.height - 1) % self.height;

        cells = cells.map(|(r, c)| {
            ((top + r) % self.height, (left + c) % self.width)
        });

        self.set_cells(&cells);
    }

    /// Draw a pular centered on (row, col).
    pub fn draw_pular(&mut self, row: u32, column: u32) {
        // Cells list that should set to alive.
        let mut cells = [
            (0, 2), (0, 3), (0, 4), (0, 8), (0, 9), (0, 10),
            (2, 0), (2, 5), (2, 7), (2, 12),
            (3, 0), (3, 5), (3, 7), (3, 12),
            (4, 0), (4, 5), (4, 7), (4, 12),
            (5, 2), (5, 3), (5, 4), (5, 8), (5, 9), (5, 10),
            (7, 2), (7, 3), (7, 4), (7, 8), (7, 9), (7, 10),
            (8, 0), (8, 5), (8, 7), (8, 12),
            (9, 0), (9, 5), (9, 7), (9, 12),
            (10, 0), (10, 5), (10, 7), (10, 12),
            (12, 2), (12, 3), (12, 4), (12, 8), (12, 9), (12, 10),
            ];

        let left = (column + self.width - 6) % self.width;
        let top = (row + self.height - 6) % self.height;

        cells = cells.map(|(r, c)| {
            ((top + r) % self.height, (left + c) % self.width)
        });

        self.set_cells(&cells);
    }
}

impl fmt::Display for Universe {
    /// Print cells state line by line.
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Extract each row.
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let symbol = if self.cells[idx] == false { '???' } else { '???' };
                write!(f, "{}", symbol)?;
            }
        }
        Ok(())
    }
}

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    /// Start a timer using RAII method, 
    /// which print the time elapsed at the end of life.
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    /// End the timer automatically when object out of scope.
    /// And print time elapsed in the browser console.
    fn drop(&mut self) {
        console::time_end_with_label(self.name);
    }
}
