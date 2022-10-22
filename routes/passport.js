// // @ts-check
const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoClient = require('./mongo');

module.exports = () => {
  // NAVER 로그인
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NV_CLIENT,
        clientSecret: process.env.NV_CLIENT_SECRET,
        callbackURL: process.env.NV_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('My2022').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result);
        else {
          const newUser = {
            id: profile.id,
            name: profile.emails[0].value,
            provider: profile.provider,
            posted: false,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  // KAKAO 로그인
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KA_CLIENT,
        callbackURL: process.env.KA_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('My2022').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result);
        else {
          const newUser = {
            id: profile.id,
            name: profile.displayName || profile.username,
            provider: profile.provider,
            posted: false,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  // GOOGLE 로그인
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GG_CLIENT,
        clientSecret: process.env.GG_CLIENT_SECRET,
        callbackURL: process.env.GG_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('My2022').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result);
        else {
          const newUser = {
            id: profile.id,
            name: profile.emails[0].value,
            provider: profile.provider,
            posted: false,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    const client = await mongoClient.connect();
    const userCursor = client.db('My2022').collection('users');
    const result = await userCursor.findOne({ id });
    if (result) cb(null, result);
  });
};
