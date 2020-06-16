import lru from "tiny-lru";

const max = 5;
const cache = lru(max, 0);

cache.set("myKey", "foo");
cache.set("myKey2", "bar");

console.log(cache.get("myKey"));

cache.delete("myKey");

console.log(cache.get("myKey2"));
