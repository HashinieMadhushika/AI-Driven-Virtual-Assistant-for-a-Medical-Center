// import pkg from "pg";
// const { Pool } = pkg;
// import dotenv from "dotenv";
// dotenv.config();

// const pool = new Pool({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT
// });

// pool.connect()
//   .then(() => console.log("✅ PostgreSQL Connected Successfully"))
//   .catch(err => console.error("❌ PostgreSQL Connection Error:", err));

// export default pool;
// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

<<<<<<< HEAD
// Remove the .authenticate() call that runs on import
// We'll handle connection testing in app.js instead
=======
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected via Sequelize'))
  .catch(err => console.error('❌ Sequelize connection error:', err));
>>>>>>> 370cb08690ba6cd40d2491002f59f61ec0cc2e61

export default sequelize;
