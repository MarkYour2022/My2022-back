// @ts-check
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const name = req.user?.name || '로그인 필요';
  res.render('index', { name });
});

router.get('/fail', (req, res) => {
  res.render('fail');
});

module.exports = router;
