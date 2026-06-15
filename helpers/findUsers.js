const { normalize } = require('./normalize.js');

function findUsersGuesses(memberIndex, lines) {
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
							matchLength: name.length,
							usrGuesses: guesses,
						});
					}
				}
			}
		}
	}

	return filterMatches(matches);
}

function findUsers(memberIndex, message) {
	const matches = [];
	const msgContent = normalize(message);

	for (const [usrID, member] of memberIndex) {
		for (const name of member.names) {
			if (!name) continue;

			if (msgContent.includes(name)) {
				matches.push({
					id: usrID,
					matchLength: name.length,
				});
			}
		}
	}

	return filterMatches(matches);
}

function filterMatches(matches) {
	matches.sort((a, b) => b.matchLength - a.matchLength);

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
module.exports = { findUsersGuesses, findUsers };