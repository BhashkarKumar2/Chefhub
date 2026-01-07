import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

// Initialize scheduled jobs
export const initScheduledJobs = () => {
    logger.info('Initializing scheduled jobs...');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running daily booking status update job...');

        try {
            const now = new Date();

            // 1. Cancel pending bookings that are in the past
            // "In the past" means the booking date is strictly before now (midnight of the next day)
            // Since booking.date usually stores the date part (or date+time), comparing with now (00:00) works for previous day's events.
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

            if (cancelledResult.modifiedCount > 0) {
                logger.info(`Automatically cancelled ${cancelledResult.modifiedCount} past pending bookings.`);
            }

            // 2. Mark confirmed bookings as completed
            // For bookings that were confirmed and have now passed
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

            if (completedResult.modifiedCount > 0) {
                logger.info(`Automatically completed ${completedResult.modifiedCount} past confirmed bookings.`);
            }

        } catch (error) {
            logger.error('Error running daily booking status job:', error);
        }
    });

    logger.info('Scheduled jobs initialized: Daily booking status update at 00:00.');
};
