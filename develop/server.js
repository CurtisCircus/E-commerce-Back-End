const dotenv = require('./.env.name');
const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, process.env.DB_HOST);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

sequelize.sync({ force: false }) // Set force to true if you want to drop tables and recreate on every restart
  .then(() => {
    // Start the server after syncing models
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}!`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync models and start the server:', err);
  });
