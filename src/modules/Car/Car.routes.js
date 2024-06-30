import { Router } from 'express';
import { getAllCars, getCarById, addCar, updateCar, deleteCar, getAvailableCarsByModel, getCarsByModels, getCarsByRentalStatusAndModel, getCarsByModelAndStatus } from './Car.controller.js';

const router = Router()

router.get("/", getAllCars)
router.get("/car/:id", getCarById)
router.post("/", addCar)
router.put("/:id", updateCar)
router.delete("/:id", deleteCar)
//& __________________ Special Apis ____________________ 
// Get available car by its model
router.post('/available', getAvailableCarsByModel);
// Get all cars whose model is ‘Honda’ and ‘Toyota’ (using query params)
router.get('/carBymodel/', getCarsByModels);
// Get Cars that are Either rented or of a Specific Model.
router.get('/allCars', getCarsByRentalStatusAndModel);
//Get Available Cars of Specific Models or Rented Cars of a Specific Model
router.get('/cars/:model/:status', getCarsByModelAndStatus);
export default router;  