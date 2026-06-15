function normalize(str) {
	return str
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N} ]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}

module.exports = { normalize };