import minify from "rollup-plugin-babel-minify";
import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

module.exports = {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs"
    },
    {
      file: "dist/index.es.js",
      format: "es"
    }
  ],
  plugins: [typescript(), resolve(), commonjs(), minify({ comments: false })]
};
