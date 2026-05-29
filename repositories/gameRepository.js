const db = require('../db');

async function addGame(gameNr) {
	const query = `
	INSERT INTO games(wordle_number)
	VALUES ($1)
	ON CONFLICT (wordle_number) DO NOTHING
	`;

	await db.query(query, [gameNr]);
}