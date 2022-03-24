const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { DB } = require('../db/connection');

function getTokenFromBearer(bearer) {
	if (bearer.split(' ')[0] === 'Bearer') {
		return bearer.split(' ')[1];
	}

	return null;
}

router.post('/is-access-token-valid', (req, res) => {
	const token = getTokenFromBearer(req.headers.authorization);
	jwt.verify(token, process.env.SECRET_KEY, (error, valid) => {
		if (error) {
			return res.send({ isAuth: false });
		}

		if (valid) {
			return res.send({ isAuth: true });
		}
	});
});

router.post('/check-refresh-token', async (req, res) => {
	const tokenPayload = getTokenPayload(getTokenFromBearer(req.headers.authorization));
	if (!tokenPayload) {
		return res.send({ isOk: false });
	}
	const db = await DB();
	const refreshTokenOnDB = await new Promise((resolve) => {
		db.db('messenger')
			.collection('users')
			.findOne({ email: tokenPayload.email }, (error, result) => {
				db.close();
				if (error) {
					return res.status(500).send({ error: true });
				}

				resolve(result.refreshToken);
			});
	});

	jwt.verify(refreshTokenOnDB, process.env.SECRET_KEY, (error, valid) => {
		if (error) {
			return res.send({ isOk: false });
		}

		return res.send({ isOk: true });
	});
});

router.get('/generate-new-access-token', (req, res) => {
	const tokenPayload = getTokenPayload(getTokenFromBearer(req.headers.authorization));
	if (!tokenPayload) {
		return res.send({ isOk: false });
	}

	const newAccessToken = jwt.sign({ email: tokenPayload.email }, process.env.SECRET_KEY, {
		expiresIn: '1h',
	});

	return res.send({ newAccessToken: newAccessToken });
});

function getTokenPayload(bearer) {
	return jwt.decode(bearer);
}

module.exports = router;
