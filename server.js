import "dotenv/config"
import app from "./src/app.js"
import { databaseConnection } from "./src/config/db.config.js";

async function startdb() {
    try {
        await databaseConnection()
    } catch (error) {
        console.log(error)
    }
}

startdb()

const port = process.env.PORT || 9000

app.listen(port,() =>{
    console.log(`Server is listening on port ${port}`)
});