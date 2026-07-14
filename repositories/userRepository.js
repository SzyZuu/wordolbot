const db = require('../db');

async function initializeUsers(userIds, names, streaks, guesses, totalGames, gameNr, serverID) {
	const client = await db.getClient();
	try {
		await client.query('BEGIN;');

		const query = `
		INSERT INTO users (user_id, name, streak, avg_guesses, games_played, last_played)
		SELECT 
			id, 
			user_name, 
			p_streak,
			guess,
			games,
			$6
		FROM UNNEST($1::bigint[], $2::text[], $3::numeric[], $4::numeric[], $5::numeric[]) AS t(id, user_name, p_streak, guess, games)
		ON CONFLICT (user_id) DO NOTHING
		`;
		await client.query(query, [userIds, names, streaks, guesses, totalGames, gameNr]);

		const serverQuery = `
		INSERT INTO servers (server_id, initialized) VALUES($1, TRUE)
		ON CONFLICT (server_id) DO UPDATE SET initialized = TRUE
		`;

		await client.query(serverQuery, [serverID]);

		const userServerQuery = `
		INSERT INTO user_servers (user_id, server_id) 
		SELECT
			id,
			$2
		FROM UNNEST($1::bigint[]) AS t(id)
		ON CONFLICT (user_id, server_id) DO NOTHING
		`;

		await client.query(userServerQuery, [userIds, serverID]);

		await client.query('COMMIT;');
	}
	catch (error) {
		await client.query('ROLLBACK;');
		console.log(error);
	}
	finally {
		client.release();
	}

}

async function updateTimeBuffer(userId, daytime, serverId) {
	const query = `
		INSERT INTO users (user_id, time_buffer) VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE SET time_buffer = $2
		`;

	const userServerQuery = `
		INSERT INTO user_servers (user_id, server_id) VALUES ($1, $2)
		ON CONFLICT (user_id, server_id) DO NOTHING
		`;

	const updateBuffer = db.query(query, [userId, daytime]);
	const updateUserServer = db.query(userServerQuery, [userId, serverId]);

	await Promise.all([updateBuffer, updateUserServer]);
}

async function updateUser(userId, currentWordle) {
	const query = `
	UPDATE users
	SET
	    streak = CASE 
	        WHEN last_played = $2 - 1 THEN streak + 1
	        WHEN last_played = $2 THEN streak
			ELSE 1
		END,
		last_played = $2,
		avg_guesses = ROUND((COALESCE(avg_guesses, 0) * games_played + (SELECT guesses FROM history WHERE wordle_number = $2 AND user_id = $1)) / (games_played + 1)),
		games_played = games_played + 1
	WHERE user_id = $1
	`;

	await db.query(query, [userId, currentWordle]);
}

module.exports = { initializeUsers, updateTimeBuffer, updateUser };
