var path = require("path");

module.exports = require(path.join(__dirname, "lib", Number(process.version.replace("v", "").split(".")[0]) >= 6 ? "tiny-lru.es6" : "tiny-lru"));
