const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { DB } = require('../db/connection');
const {
	verifyAccessToken,
	getTokenFromBearer,
	getTokenPayload,
	isValidMongoID,
	isAccessTokenValid,
} = require('./auth');
const moment = require('moment');
const validator = require('validator');
const { WebSocketServer } = require('ws');
router.get('/get-latest-chats', verifyAccessToken, async (req, res) => {
	const token = getTokenFromBearer(req.headers.authorization);
	const payload = getTokenPayload(token);

	if (!isValidMongoID(payload.id)) {
		return res.send({ error: true, message: 'Invalid ID' }).status(401);
	}

	const db = await DB();

	// Prepare messages data
	db.db('messenger')
		.collection('chats_data')
		.aggregate([
			{
				$match: {
					$or: [{ userA: ObjectId(payload.id) }, { userB: ObjectId(payload.id) }],
				},
			},
			{
				$lookup: {
					from: 'chats',
					foreignField: 'chatID',
					localField: '_id',
					as: 'chats',
					pipeline: [
						{
							$sort: {
								createdAt: -1,
							},
						},
						{
							$limit: 1,
						},
						{
							$group: {
								_id: '$chatID',
								chatContent: { $push: '$chatContent' },
								receiverId: { $push: '$receiverId' },
								senderId: { $push: '$senderId' },
								chatDate: { $push: '$createdAt' },
								receiverRead: { $push: '$receiverRead' },
								chatContentId: { $push: '$_id' },
							},
						},
						{
							$unwind: '$chatContent',
						},
						{
							$unwind: '$receiverId',
						},
						{
							$unwind: '$senderId',
						},
						{
							$unwind: '$chatDate',
						},
						{
							$unwind: '$receiverRead',
						},
						{
							$unwind: '$chatContentId',
						},
					],
				},
			},
			{
				$lookup: {
					from: 'users',
					foreignField: '_id',
					localField: 'userA',
					as: 'userA_info',
					pipeline: [
						{
							$project: {
								firstName: 1,
								lastName: 1,
							},
						},
					],
				},
			},
			{
				$lookup: {
					from: 'users',
					foreignField: '_id',
					localField: 'userB',
					as: 'userB_info',
					pipeline: [
						{
							$project: {
								firstName: 1,
								lastName: 1,
							},
						},
					],
				},
			},
			{
				$unwind: '$userA_info',
			},
			{
				$unwind: '$userB_info',
			},
			{
				$unwind: '$chats',
			},
		])
		.toArray((error, result) => {
			db.close();
			if (error) {
				return res.send({ error: true, message: 'Database error occured.' }).status(401);
			}

			return res.send({ result: result });
		});
});

router.get('/get-chats/:chatID', verifyAccessToken, async (req, res) => {
	if (!ObjectId.isValid(req.params.chatID)) {
		return res.status(401).send({ error: true, message: 'ID malformed.' });
	}

	const token = getTokenFromBearer(req.headers.authorization);
	const payload = getTokenPayload(token);

	const db = await DB();
	db.db('messenger')
		.collection('chats_data')
		.aggregate([
			{
				$match: {
					_id: ObjectId(req.params.chatID),
					$or: [{ userA: ObjectId(payload.id) }, { userB: ObjectId(payload.id) }],
				},
			},
			{
				$lookup: {
					from: 'chats',
					localField: '_id',
					foreignField: 'chatID',
					as: 'chats',
					pipeline: [
						{
							$sort: { createdAt: -1 },
						},
						{
							$project: {
								chatContent: 1,
								receiverId: 1,
								senderId: 1,
							},
						},
					],
				},
			},
		])
		.toArray((err, result) => {
			if (err) {
				return res.send({ error: true, message: 'Database error occured.' });
			}

			return res.send({ error: false, chats: result[0] });
		});
});

const liveIncomingMessages = new WebSocketServer({
	port: 7780,
	path: '/live-incoming-message-list',
});

liveIncomingMessages.on('connection', (socket) => {
	socket.on('message', async (data) => {
		const parsedData = JSON.parse(data);

		liveIncomingMessages.clients.forEach((client) => {
			client.send(JSON.stringify({ chatID: parsedData.chatID }));
		});
	});
});

const messagingServer = new WebSocketServer({ port: 7778, path: '/messaging' });
messagingServer.on('connection', (socket) => {
	socket.on('message', async (data) => {
		const parsedData = JSON.parse(data);
		const chatData = await saveChat(parsedData);

		if (!chatData) {
			return socket.send(JSON.stringify({ error: true, message: 'WS problem occured.' }));
		}

		messagingServer.clients.forEach((client) => {
			client.send(JSON.stringify(chatData));
		});
	});
});

const typingServer = new WebSocketServer({ port: 7779, path: '/typing' });
typingServer.on('connection', (socket) => {
	socket.on('message', (data) => {
		const parsed = JSON.parse(data);

		typingServer.clients.forEach((client) => {
			client.send(
				JSON.stringify({
					typingState: parsed.typingState,
					typerId: parsed.typerId,
					chatID: parsed.chatID,
				})
			);
		});
	});
});

async function saveChat(data) {
	const token = getTokenFromBearer(data.authorization);

	const isAuth = await isAccessTokenValid(token);
	if (!isAuth) {
		return false;
	}
	const payload = getTokenPayload(token);

	if (!ObjectId.isValid(payload.id) || !ObjectId.isValid(data.chatID)) {
		return false;
	}

	if (validator.isEmpty(data.chatContent)) {
		return false;
	}

	const db = await DB();

	// check if authorized to chat on the chat ID
	const userIDs = await new Promise((resolve) => {
		db.db('messenger')
			.collection('chats_data')
			.aggregate([
				{
					$match: {
						_id: ObjectId(data.chatID),
						$or: [{ userA: ObjectId(payload.id) }, { userB: ObjectId(payload.id) }],
					},
				},
			])
			.toArray((err, result) => {
				if (err) {
					db.close();

					return false;
				}

				if (result.length === 0) {
					db.close();

					return false;
				}
				// Continue if authorized
				resolve({ userA: result[0].userA, userB: result[0].userB });
			});
	});

	const insertConfig = {
		chatContent: data.chatContent,
		chatID: ObjectId(data.chatID),
		senderId: null,
		receiverId: null,
		createdAt: parseInt(moment(new Date()).unix()),
		receiverRead: false,
	};

	if (userIDs.userA.toString() === payload.id) {
		insertConfig.senderId = ObjectId(userIDs.userA);
		insertConfig.receiverId = ObjectId(userIDs.userB);
	} else {
		insertConfig.senderId = ObjectId(userIDs.userB);
		insertConfig.receiverId = ObjectId(userIDs.userA);
	}

	return await new Promise((resolve) => {
		db.db('messenger')
			.collection('chats')
			.insertOne(insertConfig, (err, result) => {
				db.close();
				if (err) {
					resolve(false);
				}

				resolve(insertConfig);
			});
	});
}

router.post('/set-chat-read/:chatContentID', verifyAccessToken, async (req, res) => {
	if (!ObjectId.isValid(req.params.chatContentID)) {
		return res.send(404);
	}

	const db = await DB();
	db.db('messenger')
		.collection('chats')
		.updateOne({ _id: ObjectId(req.params.chatContentID) }, { $set: { receiverRead: true } });
});

router.get('/find/:name', verifyAccessToken, async (req, res) => {
	const db = await DB();

	const token = getTokenFromBearer(req.headers.authorization);
	const payload = getTokenPayload(token);

	db.db('messenger')
		.collection('users')
		.aggregate([
			{
				$project: {
					name: { $concat: ['$firstName', ' ', '$lastName'] },
				},
			},
			{
				$match: { name: new RegExp(req.params.name, 'i'), _id: { $ne: ObjectId(payload.id) } },
			},
		])
		.toArray((error, result) => {
			db.close();
			if (error) {
				return res.status(500);
			}

			return res.send({ people: result });
		});
});

router.post('/make-friends', verifyAccessToken, async (req, res) => {
	if (!ObjectId.isValid(req.body.with)) {
		return res.status(401);
	}
	const token = getTokenFromBearer(req.headers.authorization);
	const payload = getTokenPayload(token);

	// check if already friend
	// if friend, get chatroom id

	const db = await DB();
	await new Promise((resolve) => {
		db.db('messenger')
			.collection('chats_data')
			.aggregate([
				{
					$match: {
						$or: [
							{
								$and: [{ userA: ObjectId(payload.id) }, { userB: ObjectId(req.body.with) }],
							},
							{
								$and: [{ userB: ObjectId(payload.id) }, { userA: ObjectId(req.body.with) }],
							},
						],
					},
				},
			])
			.toArray((error, result) => {
				if (error) {
					db.close();
					return res.status(500);
				}
				console.log(result);
				if (result.length > 0) {
					db.close();
					return res.send({
						chatRoomId: result[0]._id,
					});
				}

				resolve();
			});
	});

	// if not yet friend, create then open chat room
	db.db('messenger')
		.collection('chats_data')
		.insertOne(
			{ userA: ObjectId(payload.id), userB: ObjectId(req.body.with) },
			(error, result) => {
				if (error) {
					return res.send({
						isAddFriendSuccess: false,
						message: 'Database error occured.',
					});
				}

				return res.send({
					chatRoomId: result.insertedId,
				});
			}
		);
});

module.exports = router;
