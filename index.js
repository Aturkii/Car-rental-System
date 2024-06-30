import express from 'express'
import carRoutes from './src/modules/Car/Car.routes.js';
import customerRoutes from './src/modules/Customers/Customers.routes.js';
import rentalRoutes  from './src/modules/Rentals/Rentals.routes.js';
import db from './db/connection.js';

const app = express()
const port = 3000
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use('/cars', carRoutes);
app.use('/customers', customerRoutes);
app.use('/rentals', rentalRoutes);


app.get('*', (req, res, next) => res.send('404! not found').status(404));
app.listen(port, () => console.log(`Example app listening on port ${port}!`))