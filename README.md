# Game of life in WASM 🦀
This is a small demo of Conway's Game of Life written in Rust using web assembly.

The game cells are stored in wasm memory and represented as a one-dimensional vector. The pointer of the vector is shared to the  javascript runtime in order to render the game state. I've also written a simple abstraction to easily query the
the state of the cells and manage their behaviour.

The project is bundled with the webpack.

![hello (online-video-cutter com)](https://github.com/user-attachments/assets/9d32895b-8e00-4cc6-9ef8-a8cb9f5a0c6a)
