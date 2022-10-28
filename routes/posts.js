// @ts-check
const express = require('express');

const router = express.Router();

const mongoClient = require('./mongo');

// 글쓰기
router.get('/new', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const result = await cursor.findOne({ post_user: req.body.id });

  if (result) res.status(200).json({ posted: true });
  else if (result === null) res.status(200).json({ posted: false });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

router.post('/new', async (req, res) => {
  if (req.body.id && req.body.content) {
    const client = await mongoClient.connect();
    const postsCursor = client.db('My2022').collection('posts');

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
      post_user: req.body.id,
      post_content: req.body.content,
      post_comments: [],
    };

    const postResult = await postsCursor.insertOne(newPost);
    if (postResult.acknowledged)
      res.status(201).json({ message: '업데이트 성공' });
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

  if (post) res.status(200).json({ post });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

// 글 수정
router.get('/:postId/edit', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');
  const editPost = await cursor.findOne({ post_id: Number(req.params.postId) });

  if (editPost) {
    res.status(200).json({ editPost });
  } else {
    const err = new Error('수정 권한이 없습니다');
    res.status(404).json({ message: err.message });
  }
});

router.post('/:postId/edit', async (req, res) => {
  if (req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');
    const result = await cursor.updateOne(
      { post_id: Number(req.params.postId) },
      { $set: { post_content: req.body.content } }
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

// 글 삭제
router.delete('/:postId/delete', async (req, res) => {
  const client = await mongoClient.connect();
  const postsCursor = client.db('My2022').collection('posts');

  const postResult = await postsCursor.deleteOne({
    post_id: Number(req.params.postId),
  });
  if (postResult.acknowledged)
    res.status(200).json({ message: '업데이트 성공' });
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

// 댓글 수정
router.post('/:postId/:commentId/editComment', async (req, res) => {
  if (req.body.name) {
    const client = await mongoClient.connect();
    const cursor = client.db('My2022').collection('posts');

    const editComment = {
      comment_id: Number(req.params.commentId),
      ...req.body,
    };

    const result = await cursor.findOneAndUpdate(
      { post_id: Number(req.params.postId) },
      { $set: { 'post_comments.$[element]': editComment } },
      { arrayFilters: [{ 'element.comment_id': Number(req.params.commentId) }] }
    );
    if (result.ok) res.status(201).json({ message: '업데이트 성공' });
    else {
      const err = new Error('통신 이상');
      res.status(404).json({ message: err.message });
    }
  } else {
    const err = new Error('Unexpected form data');
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:postId/:commentId/delComment', async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('My2022').collection('posts');

  const result = await cursor.updateOne(
    { post_id: Number(req.params.postId) },
    { $pull: { post_comments: { comment_id: Number(req.params.commentId) } } }
  );

  if (result.acknowledged) res.status(200).json({ message: '업데이트 성공' });
  else {
    const err = new Error('통신 이상');
    res.status(404).json({ message: err.message });
  }
});

module.exports = router;
