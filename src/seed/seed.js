require('dotenv').config();
const { connectDB } = require('../config/db');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');

async function seed() {
  await connectDB();

  const roomsCount = await Room.countDocuments();
  if (roomsCount === 0) {
    await Room.create([
      { number: '101', type: 'single', price: 1500 },
      { number: '102', type: 'double', price: 2500 },
      { number: '103', type: 'double', price: 2500 },
      { number: '104', type: 'double', price: 2500 },
      { number: '105', type: 'double', price: 2500 },
      { number: '106', type: 'double', price: 2500 },
      { number: '107', type: 'double', price: 2500 },
      { number: '108', type: 'double', price: 2500 },
      { number: '109', type: 'double', price: 2500 },
      { number: '110', type: 'suite', price: 5000 }
    ]);
    console.log('Seeded rooms');
  }

  const guestsCount = await Guest.countDocuments();
  if (guestsCount === 0) {
    await Guest.create([
      {
        name: 'Alice Mercado',
        email: 'alice@example.com',
        phone: '09171234567',
        checkInDate: new Date('2023-10-01'),  
        checkOutDate: new Date('2023-10-05') 
      },
      {
        name: 'Bob Santos',
        email: 'bob@example.com',
        phone: '09179876543',
        checkInDate: new Date('2023-10-02'),
        checkOutDate: new Date('2023-10-06')
      },
      {
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '09179876543',
        checkInDate: new Date('2023-10-02'),
        checkOutDate: new Date('2023-10-06')
      },
      {
        name: 'Pedro Lopez',
        email: 'pedro@example.com',
        phone: '09179876543',
        checkInDate: new Date('2023-10-02'),
        checkOutDate: new Date('2023-10-06')
      },
      {
        name: 'Vivian Joy Elemento',
        email: 'vivian@example.com',
        phone: '09179876544',
        checkInDate: new Date('2023-10-02T00:00:00Z'),  
        checkOutDate: new Date('2023-10-06T00:00:00Z')  
      }
    ]);
    console.log('Seeded guests');
  }

  const bookingCount = await Booking.countDocuments();
  if (bookingCount === 0) {
    const guests = await Guest.find();
    const rooms = await Room.find();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await Booking.create({
      guest: guests[0]._id,
      room: rooms[0]._id,
      checkIn: tomorrow,
      checkOut: dayAfter,
      status: 'confirmed'
    });

    console.log('Seeded bookings');
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});


