// @ts-check
const express = require('express');

const router = express.Router();

const mongoClient = require('./mongo');
const login = require('./login');

router.get('/new', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('users');
  const result = await cursor.findOne({ id: req.user.id });

  if (!result.posted) res.render('posts');
  else res.send('이미 글이 존재합니다.<br><a href="/">HOME</a>');

  // if (result) res.status(200).json({ posted: result.posted });
  // else {
  //   const err = new Error('통신 이상');
  //   res.status(404).json({ message: err.message });
  // }
});

router.post('/new', login.isLogin, async (req, res) => {
  if (req.body.name) {
    // DB 연결
    const client = await mongoClient.connect();
    const postsCursor = client.db('My2022').collection('posts');
    const usersCursor = client.db('My2022').collection('users');

    // postId 처리
    let postId = 1;
    const postsCount = await postsCursor.count();
    if (postsCount > 0) {
      const lastPost = await postsCursor.findOne(
        {},
        { sort: { $natural: -1 } }
      );
      postId = lastPost.postId + 1;
    }

    // post 처리
    const newPost = {
      postId,
      post_user: req.user.id,
      post_content: {
        name: req.body.name,
        a1: req.body.a1,
        a2: req.body.a2,
        a3: req.body.a3,
        a4: req.body.a4,
        a5: req.body.a5,
        a6: req.body.a6,
        a7: req.body.a7,
        a8: req.body.a8,
        a9: req.body.a9,
        a10: req.body.a10,
        d1: req.body.d1 ? req.body.d1 : '',
        d2: req.body.d2 ? req.body.d2 : '',
        d3: req.body.d3 ? req.body.d3 : '',
        d4: req.body.d4 ? req.body.d4 : '',
        d5: req.body.d5 ? req.body.d5 : '',
        d6: req.body.d6 ? req.body.d6 : '',
        d7: req.body.d7 ? req.body.d7 : '',
        d8: req.body.d8 ? req.body.d8 : '',
        d9: req.body.d9 ? req.body.d9 : '',
        d10: req.body.d10 ? req.body.d10 : '',
      },
      post_comments: [],
    };
    await postsCursor.insertOne(newPost);

    // user-posted 항목 처리
    await usersCursor.updateOne(
      { id: req.user.id },
      { $set: { posted: true } }
    );
    res.redirect('/');

    // const postResult = await postsCursor.insertOne(newPost);
    // const userResult = await usersCursor.updateOne(
    //   { id: req.user.id },
    //   { $set: { posted: true } }
    // );
    // if (postResult.acknowledged && userResult.acknowledged)
    //   res.status(201).json({ message: '업데이트 성공' });
    // else {
    //   const err = new Error('통신 이상');
    //   res.status(404).json({ message: err.message });
    // }
  } else {
    const err = new Error('Unexpected form data');
    err.statusCode = 404;
    throw err;

    // const err = new Error('Unexpected form data');
    // res.status(400).json({ message: err.message });
  }
});

module.exports = router;
