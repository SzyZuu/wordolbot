const db = require('../db');

async function initializeUsers(userIds, names, streaks, guesses, gameNr, serverID) {
	const query = `
	INSERT INTO users (user_id, name, streak, avg_guesses, games_played, last_played)
	SELECT 
		id, 
		user_name, 
		p_streak,
		guess,
		1,
		$5
	FROM UNNEST($1::bigint[], $2::text[], $3::numeric[], $4::numeric[]) AS t(id, user_name, p_streak, guess)
	ON CONFLICT (user_id) DO NOTHING
	`;
	await db.query(query, [userIds, names, streaks, guesses, gameNr]);

	const userServerQuery = `
	INSERT INTO user_servers (user_id, server_id) 
	SELECT
	    id,
	    $2
	FROM UNNEST($1::bigint[]) AS t(id)
	ON CONFLICT (user_id, server_id) DO NOTHING
	`;

	await db.query(userServerQuery, [userIds, serverID]);
}

async function updateTimeBuffer(userId, daytime, serverId) {
	const client = await db.getClient();
	try {
		await client.query('BEGIN');

		const query = `
		INSERT INTO users (user_id, time_buffer) VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE SET time_buffer = $2
		`;

		await client.query(query, [userId, daytime]);

		const userServerQuery = `
		INSERT INTO user_servers (user_id, server_id) VALUES ($1, $2)
		ON CONFLICT (user_id, server_id) DO NOTHING
		`;

		await client.query(userServerQuery, [userId, serverId]);

		await client.query('COMMIT');
	}
	catch (e) {
		await client.query('ROLLBACK');
		console.error(e);
	}
	finally {
		client.release();
	}
}

module.exports = { initializeUsers, updateTimeBuffer };