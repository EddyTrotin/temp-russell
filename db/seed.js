const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Catway = require('../models/catway');
const Reservation = require('../models/reservation');

// MongoDB connection options
const clientOptions = {
    useNewUrlParser: true,
    dbName: 'apiNode'
};

// Read JSON data files
const catways = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/catways.json'), 'utf8'));
const reservations = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/reservations.json'), 'utf8'));

// Function to seed the database
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.URL_MONGO || 'mongodb://localhost:27017/apiNode', clientOptions);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Catway.deleteMany({});
        await Reservation.deleteMany({});
        console.log('Previous data cleared');

        // Insert catways
        await Catway.insertMany(catways);
        console.log(`${catways.length} catways inserted`);

        // Insert reservations
        await Reservation.insertMany(reservations);
        console.log(`${reservations.length} reservations inserted`);

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase(); 