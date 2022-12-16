// @ts-check
const express = require('express');

const router = express.Router();

const mongoClient = require('./mongo');

// 작성한 글이 있는지 체크
router.get('/new/:userId', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const result = await cursor.findOne({ user_id: Number(req.params.userId) });

  if (result) res.status(200).json({ posted: true });
  else if (result === null) res.status(200).json({ posted: false });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

// 글쓰기
router.post('/new', async (req, res) => {
  if (req.body.user_id && req.body.post_content) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');

    let postId = 1;
    const count = await cursor.count();
    if (count > 0) {
      const lastPost = await cursor.findOne({}, { sort: { $natural: -1 } });
      postId = lastPost.post_id + 1;
    }

    const newPost = {
      post_id: postId,
      ...req.body,
      post_comments: [],
    };

    const result = await cursor.insertOne(newPost);
    if (result.acknowledged) res.status(201).json({ newPost });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

// 글 조회
router.get('/:userId', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const post = await cursor.findOne({ user_id: Number(req.params.userId) });

  if (post) res.status(200).json({ post });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

// 글 수정
router.post('/:postId/edit', async (req, res) => {
  if (req.body.post_content) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');
    const result = await cursor.updateOne(
      { post_id: Number(req.params.postId) },
      { $set: { post_content: req.body.post_content } }
    );

    if (result.acknowledged) res.status(200).json({ message: '글 수정 완료' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

// 글 삭제
router.delete('/:postId/delete', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');

  const result = await cursor.deleteOne({
    post_id: Number(req.params.postId),
  });
  if (result.acknowledged) res.status(200).json({ message: '글 삭제 완료' });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

// 댓글 등록
router.post('/:postId/newComment', async (req, res) => {
  if (req.body.name) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');

    const post = await cursor.findOne({ post_id: Number(req.params.postId) });
    let commentId = 1;
    const commentCount = post.post_comments.length;
    if (commentCount > 0)
      commentId = post.post_comments[commentCount - 1].comment_id + 1;

    const newComment = {
      comment_id: commentId,
      ...req.body,
    };

    const result = await cursor.updateOne(
      { post_id: Number(req.params.postId) },
      { $push: { post_comments: newComment } }
    );
    if (result.acknowledged)
      res.status(200).json({ message: '댓글 등록 완료' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

// 댓글 수정
router.post('/:postId/:commentId/editComment', async (req, res) => {
  if (req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');

    const result = await cursor.findOneAndUpdate(
      { post_id: Number(req.params.postId) },
      { $set: { 'post_comments.$[element].content': req.body.content } },
      { arrayFilters: [{ 'element.comment_id': Number(req.params.commentId) }] }
    );
    if (result.ok) res.status(200).json({ message: '댓글 수정 완료' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

// 댓글 삭제
router.delete('/:postId/:commentId/delComment', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');

  const result = await cursor.updateOne(
    { post_id: Number(req.params.postId) },
    { $pull: { post_comments: { comment_id: Number(req.params.commentId) } } }
  );

  if (result.acknowledged) res.status(200).json({ message: '댓글 삭제 완료' });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

module.exports = router;
