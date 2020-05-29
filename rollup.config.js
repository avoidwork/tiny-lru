const { terser } = require("rollup-plugin-terser");

export default [
  {
    input: "./src/lru.js",
    output: [
      {
        file: "lib/tiny-lru.cjs.js",
        format: "cjs",
      },
      {
        file: "lib/tiny-lru.esm.js",
        format: "es",
        compact: true,
        plugins: [terser()],
      },
      {
        file: "lib/tiny-lru.js",
        name: "tiny-lru",
        format: "umd",
        compact: true,
        plugins: [terser()],
      },
    ],
  },
];
