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

async function updateTimeBuffer(userId, daytime) {
	const query = `
	UPDATE users SET time_buffer = $2 WHERE user_id = $3 
	`;

	await db.query(query, [userId, daytime]);
}