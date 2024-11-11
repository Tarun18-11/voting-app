import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routes.js'

const app = express();
dotenv.config();
connectDB();


const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());
app.use('/api',routes)



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
