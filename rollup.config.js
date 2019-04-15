const resolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const commonjs = require("rollup-plugin-commonjs");

const dependencies = Object.keys(require("./package.json").dependencies);
module.exports = {
    input: "src/index.js",
    output: {
        file: "dist/expressive.bundle.js",
        format: "cjs"
    },
    plugins: [
        resolve({
            customResolveOptions: {
                moduleDirectory: "node_modules"
            }
        }),
        commonjs(),
        terser()
    ],
    external: dependencies
}