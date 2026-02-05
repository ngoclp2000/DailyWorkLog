import "dotenv/config";
import { createApp } from "./app.js";
import { CONFIG } from "./config.js";

const app = createApp();

app.listen(CONFIG.port, () => {
  console.log(`Backend running on port ${CONFIG.port}`);
});
