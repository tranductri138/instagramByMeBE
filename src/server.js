import { connectDB } from '#src/configs/index.js';
import { getSwaggerSpec, logger } from '#src/utils/index.js';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import app from './app.js';

const envFile = process.env.NODE_ENV === 'production' ? '.prod.env' : '.env';
dotenv.config({
    path: envFile
});

const swaggerSpec = getSwaggerSpec();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
