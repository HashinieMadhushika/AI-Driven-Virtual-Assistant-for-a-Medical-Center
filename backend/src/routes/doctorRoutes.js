const express = require("express");
const {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
} = require("./controllers/doctorController");

const router = express.Router();

router.post("/", addDoctor);
router.get("/", getDoctors);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;
