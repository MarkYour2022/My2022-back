// @ts-check
const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

const postsRouter = require('./routes/posts');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());

app.use('/posts', postsRouter);
// app.use('/', (req, res, next) => {
//   res.sendFile(path.join(__dirname + '/client/build', 'index.html'));
// });

// app.get('*', (req, res, next) => {
//   res.sendFile(path.join(__dirname + '/client/build/index.html'));
// });

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`${PORT}번 서버`);
});
