// @ts-check
const express = require('express');

const router = express.Router();
const passport = require('passport');

const isLogin = (req, res, next) => {
  if (req.user) next();
  else {
    res.status(300);
    res.send('로그인이 필요합니다.<br><a href="/">HOME</a>');
  }
  // else {
  //   res.status(300).json({ msg: '로그인 필요' });
  // }
};

// NAVER 로그인
router.get('/naver', passport.authenticate('naver'));
router.get(
  '/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/fail',
  })
);

// KAKAO 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    successRedirect: '/',
    failureRedirect: '/fail',
  })
);

// GOOGLE 로그인
router.get('/google', passport.authenticate('google', { scope: 'email' }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/fail',
  })
);

// 로그아웃
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.send('로그아웃 했습니다.<br><a href="/">HOME</a>');
    // return res.status(200).json({ msg: '로그아웃 성공' });
  });
});

module.exports = { router, isLogin };
