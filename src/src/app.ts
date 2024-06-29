import connect from "./utils/connect";
import createServer from "./utils/server";
import dotenv from "dotenv";
const port = 3005;

dotenv.config();
const app = createServer();

app.listen(port, async () => {
  await connect();
});
