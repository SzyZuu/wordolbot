const db = require('../db');

async function addSingleGameHistory(userId, wordleNumber, guesses) {
	const query = `
	INSERT INTO history (user_id, wordle_number, guesses, daytime) 
	SELECT user_id, $2, $3, time_buffer
	FROM users WHERE user_id = $1
	`;

	await db.query(query, [userId, wordleNumber, guesses]);
}

async function addGameHistory(userId, wordleNumber, guesses) {
	const query = `
	INSERT INTO history (user_id, wordle_number, guesses, daytime)
	SELECT
	    t.id,
	    $2, 
	    t.guess_amount,
		u.time_buffer
	FROM UNNEST($1::bigint[], $3::int[]) AS t(id, guess_amount)
	JOIN users u ON u.user_id = t.id
	`;

	await db.query(query, [userId, wordleNumber, guesses]);
}

module.exports = { addGameHistory, addSingleGameHistory };