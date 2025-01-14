use std::{error::Error, fmt::Display, usize};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum GameError {
    UndefinedIndex,
}

#[derive(Clone, Debug, PartialEq, Eq)]
#[wasm_bindgen]
pub enum Cell {
    Dead,
    Alive,
}

#[wasm_bindgen]
pub struct Game {
    pub size: usize,
    board: Vec<Cell>,
}

impl Display for Game {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for (idx, cell) in self.board.iter().enumerate() {
            match cell {
                Cell::Dead => write!(f, "◻")?,
                Cell::Alive => write!(f, "◼")?,
            }
            if idx % 64 == 0 {
                writeln!(f)?
            }
        }
        Ok(())
    }
}

trait AndProcess<T> {
    fn and_process(&mut self, closure: &mut dyn FnMut(T));
}

impl AndProcess<Cell> for Option<Cell> {
    fn and_process(&mut self, closure: &mut dyn FnMut(self::Cell)) {
        if self.is_some() {
            closure(
                self.clone()
                    .expect("Cell should be defined, this is a bug."),
            )
        }
    }
}

#[derive(Debug, PartialEq, Eq, Clone)]
#[wasm_bindgen]
pub struct Mapper {
    row: usize,
    col: usize,
}

#[wasm_bindgen]
impl Mapper {
    pub fn new(x: usize, y: usize) -> Self {
        Self { row: y, col: x }
    }
    fn set(&self, row: isize, col: isize) -> Option<Mapper> {
        let row = self.row.checked_add_signed(row)?;
        let col = self.col.checked_add_signed(col)?;

        Some(Self { row, col })
    }
}

#[wasm_bindgen]
impl Game {
    pub fn new(size: usize) -> Self {
        let mut bd = Vec::with_capacity(size.pow(2));

        for _ in 0..=size.pow(2) - 1 {
            bd.push(Cell::Dead);
        }

        bd[16] = Cell::Alive;
        bd[17] = Cell::Alive;
        bd[18] = Cell::Alive;

        Self { size, board: bd }
    }

    pub fn render(&self) -> String {
        format!("{self}")
    }

    pub fn get_row_col(&self, idx: usize) -> Mapper {
        Mapper {
            row: idx.saturating_div(self.size),
            col: idx % self.size,
        }
    }

    pub fn get_array(&self) -> *const Cell {
        self.board.as_ptr()
    }

    pub fn insert_cell(&mut self, idx: usize) -> Result<(), GameError> {
        let selected_cell = self.query(Some(self.get_row_col(idx))).unwrap();

        let selected_cell = if matches!(selected_cell, Cell::Dead) {
            Cell::Alive
        } else {
            Cell::Dead
        };

        self.mutate(idx, selected_cell);
        Ok(())
    }

    // Returns 0 if the index is out of bounds
    pub fn get_index(&self, mapper: Mapper) -> usize {
        mapper.row * self.size + mapper.col
    }

    pub fn query(&self, mapper: Option<Mapper>) -> Option<Cell> {
        let idx = self.get_index(mapper?);
        self.board.get(idx).cloned()
    }

    fn mutate(&mut self, idx: usize, cell_state: Cell) {
        self.board[idx] = cell_state;
    }

    pub fn tick(&mut self) {
        let mut cell_to_live: Vec<usize> = vec![];
        let mut cell_to_die: Vec<usize> = vec![];

        for (idx, cell) in self.board.clone().into_iter().enumerate() {
            let mut alive_neighbour = 0;

            let is_alive = matches!(cell, Cell::Alive);

            let curr_pos = self.get_row_col(idx);

            let count_neighbour = &mut |cell: Cell| {
                if matches!(cell, Cell::Alive) {
                    alive_neighbour += 1;
                }
            };

            // Left
            self.query(curr_pos.set(0, -1)).and_process(count_neighbour);
            // Top l
            self.query(curr_pos.set(-1, -1))
                .and_process(count_neighbour);
            // Top
            self.query(curr_pos.set(-1, 0)).and_process(count_neighbour);
            // Top R
            self.query(curr_pos.set(-1, 1)).and_process(count_neighbour);

            // Right
            self.query(curr_pos.set(0, 1)).and_process(count_neighbour);

            // Bottom R
            self.query(curr_pos.set(1, 1)).and_process(count_neighbour);
            // Bottom
            self.query(curr_pos.set(1, 0)).and_process(count_neighbour);
            // Bottom L
            self.query(curr_pos.set(1, -1)).and_process(count_neighbour);

            if is_alive {
                // Underpopulating
                if alive_neighbour < 2 {
                    cell_to_die.push(idx);
                }
                if alive_neighbour <= 3 {
                    cell_to_live.push(idx);
                }
                // Overpopulating
                if alive_neighbour > 3 {
                    cell_to_die.push(idx);
                }
                // Born
            } else if alive_neighbour == 3 {
                cell_to_live.push(idx);
            }
        }

        for idx in cell_to_live {
            self.mutate(idx, Cell::Alive);
        }
        for idx in cell_to_die {
            self.mutate(idx, Cell::Dead);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn set() {
        let reference_pos = Mapper { row: 1, col: 1 };

        let top = reference_pos.set(-1, 0);
        let bottom = reference_pos.set(1, 0);
        let right = reference_pos.set(0, 1);
        let left = reference_pos.set(0, -1);

        assert_eq!(top.unwrap(), Mapper { row: 0, col: 1 });
        assert_eq!(bottom.unwrap(), Mapper { row: 2, col: 1 });
        assert_eq!(right.unwrap(), Mapper { row: 1, col: 2 });
        assert_eq!(left.unwrap(), Mapper { row: 1, col: 0 });

        // Out of bound indexes
        let reference_pos = Mapper { row: 0, col: 0 };

        let top = reference_pos.set(-1, 0);
        let bottom = reference_pos.set(1, 0);
        let right = reference_pos.set(0, 1);
        let left = reference_pos.set(0, -1);

        assert_eq!(top, None);
        assert_eq!(bottom.unwrap(), Mapper { row: 1, col: 0 });
        assert_eq!(right.unwrap(), Mapper { row: 0, col: 1 });
        assert_eq!(left, None);
    }

    #[test]
    fn get_index() {
        let board = Game::new(64);
        let mapper = Mapper { row: 0, col: 0 };

        assert_eq!(0, board.get_index(mapper));

        let mapper = Mapper { row: 0, col: 1 };
        assert_eq!(1, board.get_index(mapper));

        let mapper = Mapper { row: 0, col: 2 };
        assert_eq!(2, board.get_index(mapper));

        let mapper = Mapper { row: 1, col: 0 };
        assert_eq!(64, board.get_index(mapper));

        let mapper = Mapper { row: 1, col: 1 };
        assert_eq!(65, board.get_index(mapper));

        let mapper = Mapper { row: 1, col: 2 };
        assert_eq!(66, board.get_index(mapper));
    }

    #[test]
    fn get_row_col() {
        let board = Game::new(64);

        let pos = board.get_row_col(0);
        assert_eq!(Mapper { row: 0, col: 0 }, pos);

        let pos = board.get_row_col(1);
        assert_eq!(Mapper { row: 0, col: 1 }, pos);

        let pos = board.get_row_col(23);
        assert_eq!(Mapper { row: 0, col: 23 }, pos);

        let pos = board.get_row_col(60);
        assert_eq!(Mapper { row: 0, col: 60 }, pos);

        let pos = board.get_row_col(64);
        assert_eq!(Mapper { row: 1, col: 0 }, pos);

        let pos = board.get_row_col(128);
        assert_eq!(Mapper { row: 2, col: 0 }, pos);

        let pos = board.get_row_col(129);
        assert_eq!(Mapper { row: 2, col: 1 }, pos);
    }

    #[test]
    fn tick() {
        // Blinker pattern
        let mut board = Game::new(64);

        board.board[103] = Cell::Alive;
        board.board[104] = Cell::Alive;
        board.board[105] = Cell::Alive;

        let blinker_pattern = [&board.board[103], &board.board[104], &board.board[105]];
        // Test alive cells
        for cell in blinker_pattern {
            assert_eq!(cell, &Cell::Alive);
        }

        board.tick();

        // Blinker middle point
        let reference_point = board.get_row_col(104);

        // Center
        assert_eq!(
            board
                .query(Some(reference_point.clone()))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Top
        assert_eq!(
            board
                .query(reference_point.set(-1, 0))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Bottom
        assert_eq!(
            board
                .query(reference_point.set(1, 0))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Left
        assert_eq!(
            board
                .query(reference_point.set(0, -1))
                .expect("Should work, this is a bug"),
            Cell::Dead
        );

        // Right
        assert_eq!(
            board
                .query(reference_point.set(0, 1))
                .expect("Should work, this is a bug"),
            Cell::Dead
        );

        board.tick();
        //
        // // Center
        assert_eq!(
            board
                .query(Some(reference_point.clone()))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Left
        assert_eq!(
            board
                .query(reference_point.set(0, -1))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Right
        assert_eq!(
            board
                .query(reference_point.set(0, 1))
                .expect("Should work, this is a bug"),
            Cell::Alive
        );

        // Row from above should be all dead
        assert_eq!(
            board
                .query(reference_point.set(-1, 0))
                .expect("Should work, this is a bug"),
            Cell::Dead
        );

        // Left
        assert_eq!(
            board
                .query(reference_point.set(-1, -1))
                .expect("Should work, this is a bug"),
            Cell::Dead
        );

        // Right
        assert_eq!(
            board
                .query(reference_point.set(-1, 1))
                .expect("Should work, this is a bug"),
            Cell::Dead
        );
    }
}
