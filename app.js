var express = require('express');
var mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 55966

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'now.wthosp.go.th',
  user: 'kow',
  password: 'pass1234',
  database: 'A_Care'
});

db.connect((err) => {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});

app.use(express.static('public'))

app.get('/posts', (req, res) => {
  const sql = "SELECT sex, COUNT(*) as count, AVG(age) as avg_age, AVG(bmi) as avg_bmi FROM web WHERE sex IN ('female', 'male') GROUP BY sex";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    const totalCount = results.reduce((acc, cur) => acc + cur.count, 0);
    const totalAvgAge = results.reduce((acc, cur) => acc + cur.avg_age * cur.count, 0) / totalCount;
    const totalAvgBmi = results.reduce((acc, cur) => acc + cur.avg_bmi * cur.count, 0) / totalCount;
    res.json({
      total: {
        count: totalCount,
        avg_age: totalAvgAge,
        avg_bmi: totalAvgBmi
      },
      sex: results
    });
  });
});

app.post('/posts', (req, res) => {
  const { sex1, age1, bmi } = req.body;
  if (sex1 != "female" && sex1 != "male"){
    return console.error("Who the fuck are u bitch!");
  }
  db.query('INSERT INTO web (sex, age, bmi) VALUES (?, ?, ?)', [sex1, age1, bmi ], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.send({ id: result.insertId, sex1, age1, bmi });
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  // Serve the index.html file for the root route
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });
});