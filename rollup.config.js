import minify from "rollup-plugin-babel-minify";
import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

module.exports = {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: false // WARNING: Important to be a false!
    }
  ],
  plugins: [
    typescript({ clean: true }),
    resolve(),
    commonjs(),
    minify({ comments: false })
  ]
};
