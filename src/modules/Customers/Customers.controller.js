import { ObjectId } from 'mongodb';
import db from './../../../db/connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const customerCollection = db.collection('Customer');
const JWT_SECRET = 'ahmed_jwt_secretKey';



//~ Get all customers  
export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await customerCollection.find({}).project({ password: 0 }).toArray();
    res.status(200).json({ Message: "Success", customers });
  } catch (error) {
    console.log('Error fetching customers:', error);
    res.status(500).json({ Message: 'Failed to fetch customers' });
  }
};


//~ Get Get a specific customers by id 
export const getCustomerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await customerCollection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    if (customer) {
      res.status(200).json({ "Message": "Success", customer });
    } else {
      res.status(404).json({ Message: 'Customer not found' });
    }
  } catch (error) {
    console.log('Error fetching customer:', error);
    res.status(500).json({ Message: 'Failed to fetch customer' });
  }
};


//~ Signup Customer 
export const signupCustomer = async (req, res, next) => {
  const { name, password, email, phoneNumber, id } = req.body;

  if (!name || !password || !email || !phoneNumber || !id) {
    return res.status(400).json({ Message: 'All fields are required' });
  }

  try {
    const existedCustomer = await customerCollection.findOne({ email });
    if (existedCustomer) {
      return res.status(409).json({ Message: 'Email already exists' });
    }
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newCustomer = { name, password: hashedPassword, email, phoneNumber, id };
      const customer = await customerCollection.insertOne(newCustomer);
      const insertedCustomer = await customerCollection.findOne({ _id: customer.insertedId }, { projection: { password: 0 } });
      res.status(201).json({ Message: "signed up successfully", insertedCustomer });
    }

  } catch (error) {
    console.log('Error signing up customer:', error);
    res.status(500).json({ Message: 'Failed to signup customer' });
  }
};


//~ Signin customer
export const signinCustomer = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ Message: 'Email and password are required' });
  }

  try {
    const customer = await customerCollection.findOne({ email });
    if (!customer) {
      return res.status(404).json({ Message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ Message: 'Invalid email or password' });
    }
    const { password: _, ...customerWithoutPassword } = customer;

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      message: 'Signed in successfully',
      token,
      your_Info: customerWithoutPassword,
    });
  } catch (error) {
    console.log('Error signing in customer:', error);
    res.status(500).json({ Message: 'Failed to sign in customer' });
  }
};


//~ Update customer by its id 
export const updateCustomer = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phoneNumber } = req.body;

  try {
    const existedCustomer = await customerCollection.findOne({ _id: new ObjectId(id) });

    if (!existedCustomer) {
      return res.status(404).json({ Message: 'Customer not found' });
    }

    const updatedCustomer = await customerCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email, phoneNumber } }
    );

    if (updatedCustomer.modifiedCount === 0) {
      return res.status(400).json({ Message: 'Failed to update customer' });
    }

    const customer = await customerCollection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    res.status(200).json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.log('Error updating customer:', error);
    res.status(500).json({ Message: 'Failed to update customer' });
  }
};


//~ Delete customer by its id 
export const deleteCustomer = async (req, res, next) => {
  const { id } = req.params;

  try {

    const existedCustomer = await customerCollection.findOne({ _id: new ObjectId(id) });

    if (!existedCustomer) {
      return res.status(404).json({ Message: 'Customer not found' });
    }

    const deletedCustomer = await customerCollection.deleteOne({ _id: new ObjectId(id) });

    if (deletedCustomer.deletedCount === 0) {
      return res.status(400).json({ Message: 'Failed to delete customer' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.log('Error deleting customer:', error);
    res.status(500).json({ Message: 'Failed to delete customer' });
  }
};