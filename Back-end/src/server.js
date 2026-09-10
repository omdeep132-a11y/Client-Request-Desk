dotenv = require('dotenv');
dotenv.config();

app = require('./app');
connectDB = require('./DB/db');
 

connectDB();
app.listen( 3000, () => {
    console.log('Server is running on port 3000');
}    )
