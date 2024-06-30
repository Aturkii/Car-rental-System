import { ObjectId } from 'mongodb';
import db from './../../../db/connection.js';

const carCollection = db.collection('cars');

//~ GEt all cars 
export const getAllCars = async (req, res, next) => {
  try {
    const cars = await carCollection.find({}).toArray();
    res.status(200).json({ message: "Success", cars });
  } catch (error) {
    console.log('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
};


//~ Get a specific car
export const getCarById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const car = await carCollection.findOne({ _id: new ObjectId(id) });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: "success", car });
  } catch (error) {
    console.log('Error fetching car:', error);
    res.status(500).json({ message: 'Failed to fetch car' });
  }
};


//~ add car 
export const addCar = async (req, res, next) => {
  const { name, model } = req.body;

  try {
    const existedCar = await carCollection.findOne({ name, model });

    if (existedCar) {
      return res.status(400).json({ message: 'Car already exists' });
    }

    const newCar = {
      name,
      model,
      rentalStatus: 'available'
    };

    const car = await carCollection.insertOne(newCar);

    if (car.insertedCount === 0) {
      res.status(400).json({ message: "Failed to add car" });
    }
    const insertedCar = await carCollection.findOne({ _id: car.insertedId });
    res.status(201).json({
      message: 'Car added successfully',
      insertedCar
    });
  } catch (error) {
    console.log('Error adding car:', error);
    res.status(500).json({ message: 'Failed to add car' });
  }
};


//~ Update car
export const updateCar = async (req, res, next) => {
  const { id } = req.params;
  const { name, model, rentalStatus } = req.body;
  try {
    const existedCar = await carCollection.findOne({ _id: new ObjectId(id) });

    if (!existedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const result = await carCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, model, rentalStatus } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update car' });
    }

    const updatedCar = await carCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: 'Car successfully updated', updatedCar })
  } catch (error) {
    console.log('Error updating car:', error);
    res.status(500).json({ message: 'Failed to update car' });
  }
};


//~ delete car 
export const deleteCar = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existedCar = await carCollection.findOne({ _id: new ObjectId(id) });

    if (!existedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
    const result = await carCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete car' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.log('Error deleting car:', error);
    res.status(500).json({ message: 'Failed to delete car' });
  }
};


//~ get availabe car by its model
export const getAvailableCarsByModel = async (req, res, next) => {
  const { model } = req.body;
  try {
    if (!model) {
      return res.status(400).json({ message: 'Model parameter is required' });
    }
    const availableCars = await carCollection.find({ model, rentalStatus: 'available' }).toArray();
    res.json({ message: "success", availableCars });
  } catch (error) {
    console.log('Error fetching available cars:', error);
    res.status(500).json({ message: 'Failed to fetch available cars' });
  }
};


//~ Get all cars whose model is ‘Honda’ and ‘Toyota’ (using queryparams)
export const getCarsByModels = async (req, res, next) => {
  const { models } = req.query;
  console.log(models);
  try {
    if (!models) {
      return res.status(400).json({ message: 'Models parameter is required' });
    }

    const modelArray = models.split(',');
    const cars = await carCollection.find({ model: { $in: modelArray } }).toArray();

    res.json({ message: "success", cars });
  } catch (error) {
    console.log('Error fetching cars by models:', error);
    res.status(500).json({ message: 'Failed to fetch cars by models' });
  }
};


//~ Get Cars that are Either rented or of a Specific Model.
export const getCarsByRentalStatusAndModel = async (req, res, next) => {
  const { model, rentalStatus } = req.query;
  console.log('Received parameters:', { model, rentalStatus });

  try {
    const query = {};

    if (model) {
      query.model = model;
    }

    if (rentalStatus) {
      query.rentalStatus = rentalStatus;
    }
    if (!model && !rentalStatus) {
      return res.status(400).json({ message: 'Please provide model or rentalStatus query parameter' });
    }

    const cars = await carCollection.find(query).toArray();

    res.json({ message: "success", cars });
  } catch (error) {
    console.log('Error fetching cars by rental status and model:', error);
    console.log(error.message);
    res.status(500).json({ message: 'Failed to fetch cars by rental status and model' });
  }
};

//~ Get Available Cars of Specific Models or Rented Cars of a Specific Model
export const getCarsByModelAndStatus = async (req, res) => {
  const { model, status } = req.params;

  try {
    let query = {};
    if (model && status) {
      if (status === 'available') {
        query.model = model;
        query.rentalStatus = 'available';
      } else if (status === 'rented') {
        query.model = model;
        query.rentalStatus = 'rented';
      }
    } else if (model) {
      query.model = model;
    }
    console.log('Query:', query);
    const cars = await carCollection.find(query).toArray();

    res.status(200).json({ message: "success", cars });
  } catch (error) {
    console.log('Error fetching cars:', error);
    res.status(500).json({ message: 'Failed to fetch cars' });
  }
}; 