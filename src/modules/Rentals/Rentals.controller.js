import { ObjectId } from 'mongodb';
import db from './../../../db/connection.js';

const rentalCollection = db.collection('rentals');
const carCollection = db.collection('cars');
const customerCollection = db.collection('Customer');



//~ GEt all rentals 
export const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await rentalCollection.find({}).toArray();
    res.json({ message: "success", rentals });
  } catch (error) {
    console.log('Error fetching rentals:', error);
    res.status(500).json({ message: 'Failed to fetch rentals' });
  }
};



//~ create new rental  
export const createRental = async (req, res, next) => {
  const { carId } = req.body;
  const { customerId } = req.params;

  try {
    console.log('Customer ID:', customerId);

    const customer = await customerCollection.findOne({ _id: new ObjectId(customerId) });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found', customerId });
    }

    const car = await carCollection.findOne({ _id: new ObjectId(carId) });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    if (car.rentalStatus !== 'available') {
      return res.status(400).json({ message: 'This car is already rented' });
    }

    const newRental = {
      carId: new ObjectId(carId),
      customerId: new ObjectId(customerId),
      rentalDate: new Date(req.body.rentalDate),
      returnDate: new Date(req.body.returnDate),
    };

    const rental = await rentalCollection.insertOne(newRental);

    if (rental.insertedCount === 0) {
      return res.status(400).json({ message: 'Failed to create rental' });
    }

    await carCollection.updateOne(
      { _id: new ObjectId(carId) },
      { $set: { rentalStatus: 'rented' } }
    );
    res.status(201).json({
      message: 'Rental created successfully',
      rental
    });

  } catch (error) {
    console.log('Error creating rental:', error);
    res.status(500).json({ message: 'Failed to create rental' });
  }
};


//~ Update rental
export const updateRental = async (req, res, next) => {
  const { rentalId } = req.params;
  const { carId, customerId, rentalDate, returnDate } = req.body;

  try {
    const existedRental = await rentalCollection.findOne({ _id: new ObjectId(rentalId) });
    if (!existedRental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const updatedRental = {
      carId: carId ? new ObjectId(carId) : existedRental.carId,
      customerId: customerId ? new ObjectId(customerId) : existedRental.customerId,
      rentalDate: rentalDate ? new Date(rentalDate) : existedRental.rentalDate,
      returnDate: returnDate ? new Date(returnDate) : existedRental.returnDate,
    };
    const rental = await rentalCollection.updateOne(
      { _id: new ObjectId(rentalId) },
      { $set: updatedRental }
    );

    if (rental.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update rental' });
    }

    if (carId) {
      await carCollection.updateOne(
        { _id: updatedRental.carId },
        { $set: { rentalStatus: 'rented' } }
      );
    }
    res.json({
      message: 'Rental updated successfully',
      updatedRental
    });

  } catch (error) {
    console.log('Error updating rental:', error);
    res.status(500).json({ message: 'Failed to update rental' });
  }
};


//~ Get a specific Rental 
export const getRentalById = async (req, res, next) => {
  const { rentalId } = req.params;

  try {
    const rental = await rentalCollection.findOne({ _id: new ObjectId(rentalId) });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    res.json({ message: "success", rental });
  } catch (error) {
    console.log('Error fetching rental:', error);
    res.status(500).json({ message: 'Failed to fetch rental' });
  }
};


//~ delete rental
export const deleteRental = async (req, res, next) => {
  const { rentalId } = req.params;

  try {

    const existingRental = await rentalCollection.findOne({ _id: new ObjectId(rentalId) });

    if (!existingRental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    const result = await rentalCollection.deleteOne({ _id: new ObjectId(rentalId) });
    if (result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete rental' });
    }
    await carCollection.updateOne(
      { _id: existingRental.carId },
      { $set: { rentalStatus: 'available' } }
    );

    res.json({ message: 'Rental deleted successfully' });

  } catch (error) {
    console.log('Error deleting rental:', error);
    res.status(500).json({ message: 'Failed to delete rental' });
  }
}; 