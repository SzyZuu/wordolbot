const { normalize } = require('./normalize.js');

function findUsers(memberIndex, lines) {
	const matches = [];
	for (const line of lines) {
		const match = line.match(/([1-6xX])\/6/i);

		if (match) {
			const score = match[1].toUpperCase();
			const guesses = score === 'X' ? 7 : parseInt(score, 10);

			const msgContent = normalize(line);
			for (const [usrID, member] of memberIndex) {
				for (const name of member.names) {
					if (!name) continue;

					if (msgContent.includes(name)) {
						matches.push({
							id: usrID,
							name,
							score: name.length,
							usrGuesses: guesses,
						});
					}
				}
			}
		}
	}

	matches.sort((a, b) => b.score - a.score);

	const final = [];
	const used = new Set();

	for (const m of matches) {
		if (!used.has(m.id)) {
			final.push(m);
			used.add(m.id);
		}
	}

	return final;
}

module.exports = { findUsers };