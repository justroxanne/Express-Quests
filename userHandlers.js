const database = require('./database');

const getUsers = (req, res) => {
  let sql = 'SELECT * FROM users ';
  const sqlValues = [];

  if (req.query.language != null) {
    sql += 'WHERE language = ? ';
    sqlValues.push(req.query.language);

    if (req.query.city != null) {
      sql += 'AND city = ?';
      sqlValues.push(req.query.city);
    }
  }

  database
    .query(sql, sqlValues)
    .then(([users]) => {
      users.map((user) => {
        delete user.hashedPassword;
        return user;
      });
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query('SELECT * FROM users WHERE id = ?', [id])
    .then(([users]) => {
      if (users[0] != null) {
        delete users[0].hashedPassword;
        res.json(users[0]);
      } else {
        res.status(404).send('Not Found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const addUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  database
    .query(
      'INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving the user');
    });
};

const updateUser = (req, res) => {
  const { firstname, lastname, email, city, language, password } = req.body;
  const id = parseInt(req.params.id);

  database
    .query(
      'UPDATE users SET firstname = ?, lastname= ?, email = ?, city = ?, language = ?, hashedPassword = ? WHERE id = ?',
      [firstname, lastname, email, city, language, password, id]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found');
      } else {
        res.send(req.body).status(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error editing the user');
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query('DELETE FROM users WHERE id = ?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found');
      } else {
        res.status(204).send('No Content');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error deleting the user');
    });
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;

  database
    .query('SELECT * from USERS WHERE email = ?', [email])
    .then(([users]) => {
      if (users[0] != null) {
        req.user = users[0];

        next();
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext,
};
