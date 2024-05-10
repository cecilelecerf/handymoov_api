import connect from "./utils/connect";
import createServer from "./utils/server";

const port = 3003;

const app = createServer();

app.listen(port, async () => {
  await connect();
});
