const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connect database successfully");
    } catch (error) {
        console.log(`Connect database failed, error: ${error.message}`);
    }
};

module.exports = dbConnect;
