const Doctor = require("../models/Doctor");

exports.addDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.json(doctor);
};

exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.findAll();
  res.json(doctors);
};

exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  await Doctor.update(req.body, { where: { id } });
  res.json({ msg: "Doctor updated" });
};

exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  await Doctor.destroy({ where: { id } });
  res.json({ msg: "Doctor deleted" });
};
