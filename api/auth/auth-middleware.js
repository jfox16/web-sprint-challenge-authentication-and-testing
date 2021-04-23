const bcrypt = require("bcryptjs");
const User = require("../users/users-model");

function validateUser(req, res, next) {
  const { username, password } = req.body;
  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    next({ status: 400, message: "username and password required" });
  } else {
    next();
  }
}

function checkUsernameUnique(req, res, next) {
  const username = req.body.username;
  User.findBy({ username })
    .then((user) => {
      if (!user) {
        next();
      } else {
        next({ status: 400, message: "username taken" });
      }
    })
    .catch(next);
}

function hashPassword(req, res, next) {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 8);
  req.body.password = hashedPassword;
  next();
}

function checkUsernameExists(req, res, next) {
  const username = req.body.username;
  User.findBy({ username })
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        next({ status: 401, message: "invalid credentials" });
      }
    })
    .catch(next);
}

function checkPassword(req, res, next) {
  if (bcrypt.compareSync(req.body.password, req.user.password)) {
    next();
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
}

module.exports = {
  validateUser,
  checkUsernameUnique,
  checkUsernameExists,
  hashPassword,
  checkPassword,
};
