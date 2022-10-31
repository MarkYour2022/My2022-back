// @ts-check
const express = require('express');
const cors = require('cors');

require('dotenv').config();
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT;

const router = require('./routes/index');
const loginRouter = require('./routes/login');
const passportRouter = require('./routes/passport');
const postsRouter = require('./routes/posts');

passportRouter();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

app.use(
  session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', router);
app.use('/auth', loginRouter.router);
app.use('/posts', postsRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`${PORT}번 서버`);
});
