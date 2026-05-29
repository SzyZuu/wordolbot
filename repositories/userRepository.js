const db = require('../db');

async function updateUser(userIds, names, streaks, guesses, gameNr) {
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
	ON CONFLICT (user_id) DO UPDATE SET
		streak           = users.streak + 1,
		avg_guesses      = ROUND((COALESCE(users.avg_guesses, 0) * users.games_played + EXCLUDED.avg_guesses) / (users.games_played + 1), 1),
		games_played     = users.games_played + 1,
		last_played		 = $5;
	`;
	await db.query(query, [userIds, names, streaks, guesses, gameNr]);
}

async function getLazyUsers() {

}