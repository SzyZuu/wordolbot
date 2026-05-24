const { Pool } = require('pg');

const pool = new Pool();

module.exports = {
	query: async (text, params) => {
		const res = await pool.query(text, params);
		return res;
	},
	init_db: async () => {
		await pool.query(`
		CREATE TABLE IF NOT EXISTS users (
		  user_id BIGINT PRIMARY KEY,
		  name varchar(255),
		  streak INT,
		  played_yesterday BOOL,
		  avg_guesses DECIMAL(2, 1)
		);
		
		CREATE TABLE IF NOT EXISTS servers (
		  server_id BIGINT PRIMARY KEY
		);
		
		CREATE TABLE IF NOT EXISTS user_servers (
		  user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
		  server_id BIGINT REFERENCES servers(server_id) ON DELETE CASCADE,
		  PRIMARY KEY (user_id, server_id)
		);
		`);
	},
};