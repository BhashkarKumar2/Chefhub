
import mongoose from 'mongoose';
import '../backend/config/loadEnv.js';
import Booking from '../backend/models/Booking.js';
import Chef from '../backend/models/Chef.js';
import User from '../backend/models/User.js';
import { initScheduledJobs } from '../backend/services/cronService.js';
import { logger } from '../backend/utils/logger.js';

// Mock logger to see output in console
logger.info = console.log;
logger.error = console.error;

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Create a dummy user and chef if not exist (or just use IDs if we knew them, but safer to create/find)
        // For test simplicity, let's assume we can create a dummy booking with random IDs if validation allows, 
        // but Booking model checks for existing references. 
        // So let's just find one existing user/chef or skip if empty DB.
        const user = await User.findOne();
        const chef = await Chef.findOne();

        if (!user || !chef) {
            console.log('No user or chef found, skipping test.');
            return;
        }

        // 1. Create a "Past Pending" booking (Yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const pastPending = await Booking.create({
            user: user._id,
            chef: chef._id,
            date: yesterday,
            time: '12:00',
            duration: 2,
            guestCount: 5,
            location: 'Test Location',
            serviceType: 'daily',
            totalPrice: 100,
            status: 'pending',
            paymentStatus: 'pending'
        });
        console.log('Created past pending booking:', pastPending._id);

        // 2. Create a "Past Confirmed" booking (Yesterday)
        const pastConfirmed = await Booking.create({
            user: user._id,
            chef: chef._id,
            date: yesterday,
            time: '14:00',
            duration: 2,
            guestCount: 5,
            location: 'Test Location',
            serviceType: 'daily',
            totalPrice: 100,
            status: 'confirmed',
            paymentStatus: 'paid'
        });
        console.log('Created past confirmed booking:', pastConfirmed._id);

        // 3. Manually trigger the logic (simulate cron)
        console.log('Running update logic...');

        const now = new Date();
        // Logic from cronService.js
        const cancelledResult = await Booking.updateMany(
            {
                status: 'pending',
                date: { $lt: now }
            },
            {
                $set: {
                    status: 'cancelled',
                    updatedAt: now,
                    notes: 'Automatically cancelled by system: Date passed without confirmation'
                }
            }
        );
        console.log(`Cancelled ${cancelledResult.modifiedCount} bookings`);

        const completedResult = await Booking.updateMany(
            {
                status: 'confirmed',
                date: { $lt: now }
            },
            {
                $set: {
                    status: 'completed',
                    updatedAt: now,
                    completedAt: now
                }
            }
        );
        console.log(`Completed ${completedResult.modifiedCount} bookings`);

        // 4. Verify
        const updatedPending = await Booking.findById(pastPending._id);
        const updatedConfirmed = await Booking.findById(pastConfirmed._id);

        console.log('Updated Pending Status:', updatedPending.status); // Should be 'cancelled'
        console.log('Updated Confirmed Status:', updatedConfirmed.status); // Should be 'completed'

        // Cleanup
        await Booking.findByIdAndDelete(pastPending._id);
        await Booking.findByIdAndDelete(pastConfirmed._id);
        console.log('Cleanup done');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
