const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const validator = require('validator');
const { isStrongPassword, hashPassword, arePasswordsSimilar } = require('../functions/passwords');

const { DB } = require('../db/connection');
const { isEmailAlreadyRegistered } = require('../functions/email');

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

	const dbPassword = await new Promise((resolve) => {
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

				resolve(result[0].password);
			});
	});

	const passCorrect = await arePasswordsSimilar(req.body.password, dbPassword);
	if (!passCorrect) {
		return res.send({
			formError: true,
			message: 'Wrong credentials.',
		});
	}

	storeUserRefreshTokens(req.body.email);

	const accessToken = generateAccessToken(req.body.email);
	return res.send({
		formError: false,
		message: 'You have logged in successfully!',
		accessToken: accessToken,
	});
});

async function storeUserRefreshTokens(email) {
	const refreshToken = generateRefreshToken(email);

	const db = await DB();
	db.db('messenger')
		.collection('users')
		.updateOne({ email: email }, { $set: { refreshToken: refreshToken } }, (error, result) => {
			db.close();

			if (error) {
				console.log(error);
			}
		});
}

function generateRefreshToken(email) {
	return jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '12h' });
}

function generateAccessToken(email) {
	return jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '2h' });
}

module.exports = router;
