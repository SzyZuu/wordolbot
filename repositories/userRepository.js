const db = require('../db');

async function updateUser(userIds, names, guesses, gameNr) {
	const query = `
	INSERT INTO users (user_id, name, streak, played_yesterday, avg_guesses, games_played, last_played)
	SELECT 
		id, 
		user_name, 
		1,
		TRUE,
		guess,
		1,
		$4
	FROM UNNEST($1::bigint[], $2::text[], $3::numeric[]) AS t(id, user_name, guess)
	ON CONFLICT (user_id) DO UPDATE SET
		streak           = users.streak + 1,
		played_yesterday = TRUE,
		avg_guesses      = ROUND((COALESCE(users.avg_guesses, 0) * users.games_played + EXCLUDED.avg_guesses) / (users.games_played + 1), 1),
		games_played     = users.games_played + 1,
		last_played		 = $4;
	`;
	await db.query(query, [userIds, names, guesses, gameNr]);
}

async function getLazyUsers() {

}