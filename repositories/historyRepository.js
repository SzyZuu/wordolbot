const db = require('../db');

async function addGameHistory(userId, wordleNumber, guesses) {
	const query = `
	INSERT INTO history (user_id, wordle_number, guesses, daytime) 
	SELECT user_id, $2, $3, time_buffer
	FROM users WHERE user_id = $1
	`;

	await db.query(query, [userId, wordleNumber, guesses]);
}

