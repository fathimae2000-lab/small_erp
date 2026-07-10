const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/erp_db";

        // Hardcheck: If the connection string doesn't include the flag, append it explicitly
        if (!dbUrl.includes('retryWrites=')) {
            dbUrl = dbUrl.includes('?') 
                ? `${dbUrl}&retryWrites=false` 
                : `${dbUrl}?retryWrites=false`;
        }

        console.log(`Connecting to: ${dbUrl}`); // This lets you verify the final string in your console

        const conn = await mongoose.connect(dbUrl);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();