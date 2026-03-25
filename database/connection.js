import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

 const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "Avi@1527",
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

export default connection