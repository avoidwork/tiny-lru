const { terser } = require("rollup-plugin-terser");
const { getBabelOutputPlugin } = require("@rollup/plugin-babel");

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
        format: "esm",
        compact: true,
        plugins: [
          getBabelOutputPlugin({
            moduleId: "tiny-lru",
            presets: [
              [
                "@babel/preset-env",
                {
                  modules: "umd",
                  targets: {
                    browsers: "ie >= 11",
                  },
                },
              ],
            ],
          }),
          terser(),
        ],
      },
    ],
  },
];
