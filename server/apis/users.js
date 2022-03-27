const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const validator = require('validator');
const { isStrongPassword, hashPassword, arePasswordsSimilar } = require('../functions/passwords');

const { DB } = require('../db/connection');
const { isEmailAlreadyRegistered } = require('../functions/email');
const { verifyAccessToken, getTokenPayload, getTokenFromBearer } = require('./auth');
const { ObjectId } = require('mongodb');

async function validateRegisterPayload(req, res, next) {
	if (validator.isEmpty(req.body.firstName)) {
		return res.send({
			formError: true,
			message: 'First name cannot be empty.',
		});
	}

	if (!validator.isAlpha(req.body.firstName, 'en-US', { ignore: ' ' })) {
		return res.send({
			formError: true,
			message: 'First name must contain alphabets only.',
		});
	}
	const isEmailRegistered = await isEmailAlreadyRegistered(req.body.email);

	if (isEmailRegistered) {
		return res.send({
			formError: true,
			message: 'Email is already registered.',
		});
	}

	if (validator.isEmpty(req.body.lastName)) {
		return res.send({
			formError: true,
			message: 'Last name cannot be empty.',
		});
	}

	if (!validator.isAlpha(req.body.lastName, 'en-US', { ignore: ' ' })) {
		return res.send({
			formError: true,
			message: 'Last name must contain alphabets only.',
		});
	}

	if (!validator.isEmail(req.body.email)) {
		return res.send({
			formError: true,
			message: 'Invalid email address. [name@address.com]',
		});
	}

	if (!isStrongPassword(req.body.password)) {
		return res.send({
			formError: true,
			message:
				'Password must contain minimum of eight characters, at least one letter and one number.',
		});
	}

	next();
}

router.post('/register', validateRegisterPayload, async (req, res) => {
	const db = await DB();

	const hashedPassword = await hashPassword(req.body.password);

	db.db('messenger')
		.collection('users')
		.insertOne(
			{
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				password: hashedPassword,
			},
			(error, result) => {
				db.close();

				if (error) {
					return res.send({
						formError: true,
						message: 'Database error occured.',
					});
				}

				return res.send({
					formError: false,
					message: 'You are now registered.',
				});
			}
		);
});

async function validateLoginPayload(req, res, next) {
	if (!validator.isEmail(req.body.email)) {
		return res.send({
			formError: true,
			message: 'Invalid email address.',
		});
	}

	const isRegistered = await isEmailAlreadyRegistered(req.body.email);

	if (!isRegistered) {
		return res.send({
			formError: true,
			message: 'Email is not yet registered.',
		});
	}

	if (validator.isEmpty(req.body.password)) {
		return res.send({
			formError: true,
			message: 'Password cannot be empty.',
		});
	}

	next();
}

router.post('/login', validateLoginPayload, async (req, res) => {
	const db = await DB();

	// Get id and password
	const dbIDandPassword = await new Promise((resolve) => {
		db.db('messenger')
			.collection('users')
			.aggregate([
				{
					$match: {
						email: req.body.email,
					},
				},
				{
					$project: {
						password: 1,
					},
				},
			])
			.toArray((error, result) => {
				db.close();
				if (error) {
					return res.send({
						formError: true,
						message: 'Database error occured.',
					});
				}

				resolve({ id: result[0]._id, password: result[0].password });
			});
	});

	const passCorrect = await arePasswordsSimilar(req.body.password, dbIDandPassword.password);
	if (!passCorrect) {
		return res.send({
			formError: true,
			message: 'Wrong credentials.',
		});
	}

	storeUserRefreshTokens(dbIDandPassword.id, req.body.email);

	const accessToken = generateAccessToken(dbIDandPassword.id, req.body.email);
	return res.send({
		formError: false,
		message: 'You have logged in successfully!',
		accessToken: accessToken,
	});
});

async function storeUserRefreshTokens(id, email) {
	const refreshToken = generateRefreshToken(id, email);

	const db = await DB();
	db.db('messenger')
		.collection('users')
		.updateOne({ email: email }, { $set: { refreshToken: refreshToken } }, (error, result) => {
			db.close();
		});
}

function generateRefreshToken(id, email) {
	return jwt.sign({ id: id, email: email }, process.env.SECRET_KEY, { expiresIn: '12h' });
}

function generateAccessToken(id, email) {
	return jwt.sign({ id: id, email: email }, process.env.SECRET_KEY, { expiresIn: '2h' });
}

router.get('/my-user-id', verifyAccessToken, (req, res) => {
	const token = getTokenFromBearer(req.headers.authorization);
	const tokenPayload = getTokenPayload(token);
	return res.send({ id: tokenPayload.id });
});

router.get('/get-name/:id', verifyAccessToken, async (req, res) => {
	if (!ObjectId.isValid(req.params.id)) {
		return res.send({ error: true, message: 'ID Malformed' }).status(401);
	}

	const db = await DB();
	db.db('messenger')
		.collection('users')
		.findOne({ _id: ObjectId(req.params.id) }, (err, result) => {
			db.close();
			if (err) {
				return res.send({ error: true, message: 'Database error occured.' }).status(500);
			}

			if (!result) {
				return res.send({ error: false, message: 'Cannot find user' });
			}

			return res.send({
				firstName: result.firstName,
				lastName: result.lastName,
				fullName: `${result.firstName} ${result.lastName}`,
			});
		});
});

module.exports = router;
