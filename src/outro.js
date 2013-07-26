// CommonJS, AMD, script tag
if ( typeof exports !== "undefined" ) {
	module.exports = lru.factory;
}
else if ( typeof define === "function" ) {
	define( function () {
		return lru.factory;
	});
}
else {
	global.lru = lru.factory;
}
})( this );
