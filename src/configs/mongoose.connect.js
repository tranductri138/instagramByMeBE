import { logger } from '#src/utils/index.js';
import { connect } from 'mongoose';

export const connectDB = async () => {
    try {
        await connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_NAME
        });
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
    }
};
