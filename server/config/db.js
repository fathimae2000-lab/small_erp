const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/erp_db";

        if (!dbUrl.includes('retryWrites=')) {
            dbUrl = dbUrl.includes('?') 
                ? `${dbUrl}&retryWrites=false` 
                : `${dbUrl}?retryWrites=false`;
        }

        console.log(`Connecting to: ${dbUrl}`);

        const conn = await mongoose.connect(dbUrl);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();