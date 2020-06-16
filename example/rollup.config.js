import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "./src/index.js",
    output: {
      file: "lib/tiny-lru-example.cjs.js",
      format: "cjs",
    },
  },
  {
    input: "./src/index.js",
    output: {
      file: "lib/tiny-lru-example.js",
      name: "tiny-lru-example",
      format: "umd",
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
    ],
  },
  {
    input: "./src/index.js",
    output: {
      file: "lib/tiny-lru-example.esm.js",
      format: "es",
    },
  },
];
