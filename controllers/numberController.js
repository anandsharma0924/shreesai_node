const MobileNumber = require('../models/number');

exports.addNumber = async (req, res) => {
  const { number } = req.body;

  try {
    const newNumber = await MobileNumber.create({ number });
    res.status(201).json({ message: 'Number saved', data: newNumber });
  } catch (error) {
    res.status(500).json({ error: 'Error saving number', details: error });
  }
};

exports.getNumbers = async (req, res) => {
  try {
    const numbers = await MobileNumber.findAll({ where: { is_delete: false } });
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching numbers' });
  }
};

// Delete single number by ID
exports.deleteSingleNumber = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await MobileNumber.destroy({ where: { id } });

    if (deleted) {
      res.status(200).json({ message: 'Number deleted successfully' });
    } else {
      res.status(404).json({ error: 'Number not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting number', details: error });
  }
};

// Delete all numbers
exports.deleteAllNumbers = async (req, res) => {
  try {
    const deleted = await MobileNumber.destroy({ where: {} });

    if (deleted) {
      res.status(200).json({ message: 'All numbers deleted successfully' });
    } else {
      res.status(404).json({ error: 'No numbers found to delete' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting numbers', details: error });
  }
};
