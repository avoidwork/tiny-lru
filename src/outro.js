// CommonJS, AMD, script tag
if ( typeof exports !== "undefined" ) {
	module.exports = lru;
}
else if ( typeof define === "function" ) {
	define( function () {
		return lru;
	});
}
else {
	global.lru = lru;
}
})( this );
