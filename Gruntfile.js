module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		concat: {
			options: {
				banner: "/**\n" +
				" * <%= pkg.description %>\n" +
				" *\n" +
				" * @author <%= pkg.author %>\n" +
				" * @copyright <%= grunt.template.today('yyyy') %>\n" +
				" * @license <%= pkg.license %>\n" +
				" * @version <%= pkg.version %>\n" +
				" */\n"
			},
			dist: {
				src: [
					"src/intro.js",
					"src/lru.js",
					"src/outro.js"
				],
				dest: "lib/<%= pkg.name %>.js"
			}
		},
		copy: {
			main: {
				expand: true,
				src: "tiny-lru.d.ts",
				dest: "lib/"
			}
		},
		eslint: {
			target: [
				"index.js",
				"Gruntfile.js",
				"lib/<%= pkg.name %>.js",
				"test/*.js"
			]
		},
		nodeunit: {
			all: ["test/*.js"]
		},
		watch: {
			js: {
				files: "<%= concat.dist.src %>",
				tasks: "default"
			},
			pkg: {
				files: "package.json",
				tasks: "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-eslint");

	grunt.task.registerTask("babili", "Minifies ES2016+ code", function () {
		const fs = require("fs"),
			path = require("path"),
			data = fs.readFileSync(path.join(__dirname, "lib", "tiny-lru.js"), "utf8").replace("\"use strict\";", ""); // Stripping "use strict"; because it's injected

		try {
			const es5 = require("babel-core").transform(data, {sourceFileName: "tiny-lru.js", sourceMaps: false, presets: ["env"]});
			const minified = require("babel-core").transform(data, {sourceFileName: "tiny-lru.js", sourceMaps: true, presets: ["minify"]});

			fs.writeFileSync(path.join(__dirname, "lib", "tiny-lru.es5.js"), es5.code, "utf8");
			fs.writeFileSync(path.join(__dirname, "lib", "tiny-lru.min.js"), minified.code + "\n//# sourceMappingURL=tiny-lru.min.js.map", "utf8");
			grunt.log.ok("2 files created.");
			fs.writeFileSync(path.join(__dirname, "lib", "tiny-lru.min.js.map"), JSON.stringify(minified.map), "utf8");
			grunt.log.ok("1 sourcemap created.");
		} catch (e) {
			console.error(e.stack || e.message || e);
			throw e;
		}
	});

	// aliases
	grunt.registerTask("test", ["eslint", "nodeunit"]);
	grunt.registerTask("build", ["copy", "concat"]);
	grunt.registerTask("default", ["build", "test", "babili"]);
};
