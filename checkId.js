require('dotenv').config();

const jwt = require('jsonwebtoken');

const checkId = (req, res, next) => {
  try {
    const userId = req.params.id;
    if (req.payload.sub != userId) {
      throw new Error("Id's not matching");
    }
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

module.exports = { checkId };
