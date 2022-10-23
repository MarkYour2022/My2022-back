// @ts-check
const express = require('express');

const router = express.Router();

const mongoClient = require('./mongo');
const login = require('./login');

// 글쓰기
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
    const client = await mongoClient.connect();
    const postsCursor = client.db('My2022').collection('posts');
    const usersCursor = client.db('My2022').collection('users');

    let postId = 1;
    const postsCount = await postsCursor.count();
    if (postsCount > 0) {
      const lastPost = await postsCursor.findOne(
        {},
        { sort: { $natural: -1 } }
      );
      postId = lastPost.postId + 1;
    }

    const newPost = {
      post_id: postId,
      post_user: req.user.id,
      post_content: req.body,
      post_comments: [],
    };

    const postResult = await postsCursor.insertOne(newPost);
    const userResult = await usersCursor.updateOne(
      { id: req.user.id },
      { $set: { posted: true } }
    );
    if (postResult.acknowledged && userResult.acknowledged) res.redirect('/');
    // res.status(201).json({ message: '업데이트 성공' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

// 글 상세
router.get('/:postId', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const post = await cursor.findOne({ post_id: Number(req.params.postId) });

  let isMine = false;
  if (post.post_user === req.user.id) isMine = true;

  res.status(200).json({ post, isMine });
});

// 글 수정
router.get('/:postId/edit', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const editPost = await cursor.findOne({ post_id: Number(req.params.postId) });

  if (editPost.post_user === req.user.id) {
    res.status(200).json({ editPost });
  } else {
    const err = new Error('수정 권한이 없습니다');
    res.status(404).json({ message: err.message });
  }
});

router.post('/:postId/edit', login.isLogin, async (req, res) => {
  if (req.body.name) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');
    const result = await cursor.updateOne(
      { post_id: Number(req.params.postId) },
      { $set: { post_content: req.body } }
    );

    if (result.acknowledged) res.status(201).json({ message: '업데이트 성공' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;