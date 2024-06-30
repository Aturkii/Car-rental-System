import { Router } from "express";
import { deleteCustomer, getAllCustomers, getCustomerById, signinCustomer, signupCustomer, updateCustomer } from "./Customers.controller.js";

const router = Router();

router.get('/', getAllCustomers)
router.get('/:id', getCustomerById)
router.post("/signup", signupCustomer)
router.post('/signin', signinCustomer);
router.put("/:id", updateCustomer)
router.delete("/:id", deleteCustomer)





export default router;