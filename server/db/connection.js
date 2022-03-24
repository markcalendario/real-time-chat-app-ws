const { MongoClient } = require('mongodb');

async function DB() {
	const client = new MongoClient(process.env.DB_URI);
	const connection = await client.connect();
	return connection;
}

module.exports = {
	DB,
};
