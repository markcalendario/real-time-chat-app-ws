const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Environment Variables
require('dotenv').config({ path: './.env' });

// Middlewares
app.use('/users', require('./apis/users'));
app.use('/auth', require('./apis/auth').router);
app.use('/friends', require('./apis/friends'));

app.listen(process.env.PORT, async () => {
	console.log(`Server listening on ${process.env.PORT}`);
});
