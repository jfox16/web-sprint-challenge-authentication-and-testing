const db = require("../../data/dbConfig.js");

function find() {
  return db("users");
}

function findBy(filter) {
  return db("users").where(filter).first();
}

function findById(id) {
  return findBy({ id });
}

async function add(user) {
  const [created_user_id] = await db("users").insert(user);
  return findById(created_user_id);
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};
