import {lru} from "./dist/tiny-lru.esm.js";
import {precise} from "precise";

const nth = 2e3,
	cache = lru(nth),
	data = new Array(nth);

function seed () {
	let i = -1;

	while (++i < nth) {
		data[i] = Math.floor(Math.random() * nth);
	}
}

function populate (arg, start = 0) {
	const pnth = arg.max;
	let i = -1;

	while (++i < pnth) {
		arg.set(i + start, data[i]);
	}
}

function get (arg, start = 0) {
	const gnth = arg.max;
	let i = -1;

	while (++i < gnth) {
		arg.get(i + start, data[i]);
	}
}

function bench (n = 0, x = 1, type = "set") {
	if (type === "set") {
		seed();

		const timer = precise().start();

		populate(cache, n);
		timer.stop();
		console.log(`Run ${x} ${x === 1 ? "Set" : "Evict"} (${n === 0 ? "Low Keys" : "High Keys"}): ${timer.diff() / 1e6} ms`);
	} else if (type === "get") {
		const timer = precise().start();

		get(cache, n);
		timer.stop();
		console.log(`Run ${x} Get (${n === 0 ? "Low Keys" : "High Keys"}): ${timer.diff() / 1e6} ms`);
	}
}

console.log(`Benchmarking ${nth} items (random value per run)`);
bench();
bench(nth, 2);
bench(void 0, 3);
bench(nth, 4);
bench(nth, 5, "get");
