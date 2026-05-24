const db = require('../db');

async function updateUser(userId, name, guesses){
	const query = `
	INSERT INTO users (user_id, name, streak, played_yesterday, avg_guesses) 
	VALUES ($1, $2, $3, $4)
	ON CONFLICT (user_id) DO UPDATE SET
		streak = users.streak + 1,
		played_yesterday = TRUE,
		avg_guesses = ROUND ((COALESCE(users.avg_guesses, 0) + EXCLUDED.avg_guesses) / 2.0, 1)
	RETURNING *
	`;
}