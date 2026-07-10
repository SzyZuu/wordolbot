const { Pool } = require('pg');
const pg = require('pg');
const { createClient } = require('redis');

const pool = new Pool();
pg.types.setTypeParser(1083, function(stringValue) {
	return stringValue;
});

const client = createClient({
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	},
});

client.on('error', (err) => console.log('Redis blegh error :C ', err));
await client.connect();

async function shutdown() {
	await client.quit();
	await pool.end();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

module.exports = {
	query: async (text, params) => {
		const res = await pool.query(text, params);
		return res;
	},
	getClient: async () => {
		return await pool.connect();
	},
	setCache: async (serverId, users) => {
		await client.set(`servers:${serverId}`, JSON.stringify(users), {
			EX: 5 * 60,
		});
	},
	getCache: async (serverId) => {
		const data = await client.get(`servers:${serverId}`);
		return data === null ? null : JSON.parse(data);
	},
};