import { Router } from "express";
import { createRental, deleteRental, getAllRentals, getRentalById, updateRental } from "./Rentals.controller.js";

const router =Router();

router.get('/',getAllRentals)
router.get('/:rentalId',getRentalById)
router.post("/:customerId",createRental)
router.put("/:rentalId",updateRental)
router.delete("/:rentalId",deleteRental)






export default router;