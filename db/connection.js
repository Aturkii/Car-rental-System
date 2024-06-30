import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017/");


client.connect().then(() => {
  console.log("Connection established with Mongo server successfully");
}).catch(err => console.log("Error connecting to Mongo server", err))



const db = client.db("car_rental_system");
export default db;