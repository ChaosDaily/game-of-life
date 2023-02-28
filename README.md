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

