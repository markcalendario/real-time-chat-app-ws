const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { DB } = require('../db/connection');
const { ObjectId } = require('mongodb');

function getTokenFromBearer(bearer) {
	if (bearer.split(' ')[0] === 'Bearer') {
		return bearer.split(' ')[1];
	}

	return null;
}

function getTokenPayload(jwtTok) {
	return jwt.decode(jwtTok);
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

	const newAccessToken = jwt.sign(
		{ id: tokenPayload.id, email: tokenPayload.email },
		process.env.SECRET_KEY,
		{
			expiresIn: '1h',
		}
	);

	return res.send({ newAccessToken: newAccessToken });
});

function verifyAccessToken(req, res, next) {
	const token = getTokenFromBearer(req.headers.authorization);
	jwt.verify(token, process.env.SECRET_KEY, (error, result) => {
		if (error) {
			return res.send({ message: 'Access token expired.' }).status(401);
		}

		if (result) {
			next();
		}
	});
}

async function isAccessTokenValid(jwtTok) {
	return await new Promise((resolve) => {
		jwt.verify(jwtTok, process.env.SECRET_KEY, (error, result) => {
			if (error) {
				resolve(false);
			}

			resolve(true);
		});
	});
}

function isValidMongoID(id) {
	if (ObjectId.isValid(id)) {
		return true;
	}

	return false;
}

module.exports = {
	router: router,
	isValidMongoID: isValidMongoID,
	verifyAccessToken: verifyAccessToken,
	getTokenFromBearer: getTokenFromBearer,
	getTokenPayload: getTokenPayload,
	isAccessTokenValid: isAccessTokenValid,
};
