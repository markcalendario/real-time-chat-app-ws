const { DB } = require('../db/connection');

async function isEmailAlreadyRegistered(email) {
	const db = await DB();
	return new Promise((resolve) => {
		db.db('messenger')
			.collection('users')
			.aggregate([
				{
					$match: {
						email: email,
					},
				},
			])
			.toArray((error, result) => {
				db.close();
				if (error) {
					resolve(true);
				}

				if (result.length) {
					resolve(true);
				}

				resolve(false);
			});
	});
}

module.exports = {
	isEmailAlreadyRegistered,
};
