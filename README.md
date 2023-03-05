# Game of Life

[Tutorial](https://rustwasm.github.io/docs/book/)


## tutorial

### prepare

1. install toolchain
2. install `wasm-pack`
3. install cargo-generate, `cargo install cargo-generate`, generate a template project
4. install npm, front end stuff


### hello world

1. create a wasm-pack template project
    - `cargo generate --git https://github.com/rustwasm/wasm-pack-template`
2. basic concept of directory layout
    - `lib.rs` is the entry file we access from JS
    - `#[wasm-bindgen]` to interface with JS. Import from JS or export to it.
3. **how to build**
    - `wasm-pack build`
    - output to `pkg/`. we got a `.wasm` binary, `.js` and `.ts` file for glue
4. put into web page
    - crate a JS project tempalte `npm init wasm-app www`
    - we got a www directory, `index.js` and `index.html` is our entry point
    - install dependencies, run `npm install` inside www directory
    - add our wasm as dependencies. modify `www/package.json`
    - import our package into js, index.js
    - `npm install` again to install package
5. run: `npm run start`
    - nodejs version: v16.11.1

Then each time your rust code is done, just `wasm-pack build`


### dive in

1. Memory management between JS and WASM. ABI problem
    - JS is garbage collected lang. There is no direct access from wasm now. (2018)
    - Js can access wasm but only as ArrayBuffer. **For js wasm obj is a wrapped pointer**
2. JS to wasm interface design
    - large, long-lived data are implement as Rust types and live in the wasm linear memory export to JS as opaque handle


rust code

1. define cell
    - `#[repr(u8)]` so that each cell is a single byte
2. define universe
    - a long array, width and height
    - helper function to access cell and state change
3. tick, compute next frame

js code

1. add `<pre>` element and some style
2. import wasm code and use the object that exposed
3. print the web page as a console


#### rendering directly from memory

> The whole state is store in the wasm obj. JS can make use of it.

1. replace `<pre>` with `<canvas>`
2. draw grid using canvas API. Just some criss-cross lines.
3. access wasm linear memory via `memory`. It is define in `you_project_bg.js` see `pkg/`
    - cell color for each cell

- [Exercises](https://rustwasm.github.io/docs/book/game-of-life/implementing.html#exercises)
    * create a space ship!
    * create a random pattern: to run it in js. you should use `js-sys` crate
    * improve with bitmap


#### Adding interactivity

pause and resume

1. add `<button>`
2. get `<button>` DOM and add event
3. resume event continue draw and tick
3. pause event `cancelAnimationFrame(animationId)`

draw by hand

1. add toggle logic of cell in rust code
2. compute row and col relative to canvas
3. toggle


## Testing

1. export getter and setter
2. more helper function
3. write test: `tests/web.rs`
4. test generated wasm: `wasm-pack test [--chrome|--firefox|--node]`


## Debug

TODO: debug wasm in browser


## Time Profiling

1. JS: Record timestamp for each frame so that we can calculate FPS
2. Rust: measure how long `Universe::tick` takes
    - web-sys crate, enable console feature
    - RAII timer per tick in rust so that it can print in the console of browser

found that **change fillStyle is expensive**. So we can draw Alive Cell first and then Dead Cell.

Rust bench

1. Install [cargo benchcmp](https://github.com/BurntSushi/cargo-benchcmp) tool
2. Write micro-bench in `benches/bench.rs` path
3. **Comment `#[wasm_bindgen]`** to generate native code for bench
4. Run `cargo bench | tee before.txt` to tell where the binary is
5. Perf it

And we found that the `%` operator is expensive in counting neighbors in our case


## TODO

https://rustwasm.github.io/docs/book/game-of-life/testing.html

- improve with [hashlife algo](https://en.wikipedia.org/wiki/Hashlife)
- multi rule
- dragon curve


## Exercises

- Add some random pattern: to run it in js. you should use `js-sys` crate
- Improve with bitmap
    * `fixedbitset` crate
        + set: `cells.set(idx, bool)`, get: `cells[idx]`
- `<input type="range">` to control how many ticks per frame
- `<button>` to reset whole world or generate random world
- `ctrl + click` to generate glider and `shift + click` to generate pular
- Double buffer for cells. Since free and reallocate is expensive
- Implement delta based design: Rust return a list of cells that changed










