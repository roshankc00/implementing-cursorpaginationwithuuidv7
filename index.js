const express = require("express");
const { Client } = require("pg");

const app = express();

app.get("/students", async (req, res) => {
  const dbClient = new Client({
    user: "postgres",
    host: "localhost",
    database: "student_db",
    password: "postgres",
    port: 5432,
  });

  dbClient.connect();
  try {
    const { cursor, limit = 10 } = req.query;
    const pageSize = parseInt(limit);

    let query;
    let params;

    if (cursor) {
      query = `
        SELECT id, name, roll 
        FROM student 
        WHERE id > $1 
        ORDER BY id ASC 
        LIMIT $2
      `;
      params = [cursor, pageSize + 1];
    } else {
      query = `
        SELECT id, name, roll 
        FROM student 
        ORDER BY id ASC 
        LIMIT $1
      `;
      params = [pageSize + 1];
    }

    const result = await dbClient.query(query, params);
    const hasMore = result.rows.length > pageSize;
    const students = hasMore ? result.rows.slice(0, pageSize) : result.rows;
    const nextCursor = hasMore ? students[students.length - 1].id : null;

    res.json({
      data: students,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error(err);
  }
});

app.listen(3000, () => {
  console.log(`Yo Yo up and running`);
});
