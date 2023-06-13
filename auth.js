require('dotenv').config();

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const hashingOptions = {
  type: argon2.argon2d,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  const password = req.body.password;
  argon2
    .hash(password, hashingOptions)
    .then((hashedPassword) => {
      req.body.hashedPassword = hashedPassword;
      delete password;

      next();
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const verifyPassword = (req, res) => {
  const hashedPassword = req.user.hashedPassword;
  const password = req.body.password;
  argon2.verify(hashedPassword, password).then((isVerified) => {
    if (isVerified) {
      const payload = { sub: req.user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      delete req.user.hashedPassword;
      res.send({ token, user: req.user });
    } else {
      res.sendStatus(401);
    }
  });
};

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get('Authorization');

    if (authorizationHeader == null) {
      throw new Error('Authorization header is missing');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type != 'Bearer') {
      throw new Error('Authorization header as not the bearer type');
    }
    req.payload = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  verifyToken,
};
