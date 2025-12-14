const { Client } = require("pg");
const { faker } = require("@faker-js/faker");
const { v7: uuidv7 } = require("uuid");

const DB_NAME = "student_db";

(async () => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "postgres",
      password: "postgres",
      port: 5432,
    });

    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    await client.end();

    const dbClient = new Client({
      user: "postgres",
      host: "localhost",
      database: DB_NAME,
      password: "postgres",
      port: 5432,
    });

    await dbClient.connect();

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS student (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        roll INT NOT NULL
      );
    `);

    const total = 100;
    const values = [];
    const params = [];

    for (let i = 0; i < total; i++) {
      const id = uuidv7();
      const name = faker.person.firstName() + " " + faker.person.lastName();
      const roll = i + 1;

      params.push(id, name, roll);
      const offset = i * 3;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
    }

    const query = `INSERT INTO student (id, name, roll) VALUES ${values.join(
      ", "
    )}`;
    await dbClient.query(query, params);

    console.log("100 ota student got seeded");
    await dbClient.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
