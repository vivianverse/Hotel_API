// routes/guestRoutes.js
const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');

// Route for creating multiple guests
router.post('/guests', async (req, res) => {
    try {
        const guestsData = req.body;

        if (!Array.isArray(guestsData)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of guests.' });
        }

        const guests = await Guest.insertMany(guestsData, { ordered: true });
        return res.status(201).json({ message: 'Guests added successfully', guests });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error adding guests', error });
    }
});

// Route for Update guest information
router.put('/guests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedGuest = await Guest.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!updatedGuest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        res.json({ message: 'Guest updated successfully', guest: updatedGuest });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating guest', error });
    }
});

// DELETE Route for Delete a guest by ID
router.delete('/guests/:id', async (req, res) => {
    try {
        const { id } = req.params;

       const deletedGuest = await Guest.findByIdAndDelete(id);

        if (!deletedGuest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        res.json({ message: 'Guest deleted successfully', guest: deletedGuest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting guest', error });
    }
});

// GET Route for fetch/Retrieve all guests
router.get('/guests', async (req, res) => {
    try {
        const guests = await Guest.find(); 
        res.json({ guests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching guests', error });
    }
});

// GET Route for Retrieve specific a guest by ID
router.get('/guests/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find guest by ID
        const guest = await Guest.findById(id);

        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        res.json({ guest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching guest', error });
    }
});

module.exports = router;
