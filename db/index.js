const { Pool } = require('pg');
const pg = require('pg');

const pool = new Pool();
pg.types.setTypeParser(1083, function(stringValue) {
	return stringValue;
});

module.exports = {
	query: async (text, params) => {
		const res = await pool.query(text, params);
		return res;
	},
	getClient: async () => {
		return await pool.connect();
	},
};