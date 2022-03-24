const bcrypt = require('bcrypt');

function isStrongPassword(passPhrase) {
	const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

	if (pattern.test(passPhrase)) {
		return true;
	}

	return false;
}

async function hashPassword(plainTextPassword) {
	return await new Promise((resolve) => {
		bcrypt.hash(plainTextPassword, 10, (error, encrypt) => {
			if (error) {
				console.log(error);
			}

			resolve(encrypt);
		});
	});
}

async function arePasswordsSimilar(plain, db) {
	return new Promise((resolve) => {
		bcrypt.compare(plain, db, (error, isSame) => {
			if (error) {
				console.log(error);
			}

			resolve(isSame);
		});
	});
}

module.exports = {
	isStrongPassword,
	hashPassword,
	arePasswordsSimilar,
};
