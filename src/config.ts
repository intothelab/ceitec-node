import dotenv from "dotenv";

dotenv.config();

export default {
  apiUrl: process.env.API_URL || "https://skylt.v-labs.co/api/ceitec",
  filePath: process.env.FILE_PATH || "C:\\RAUL\\log_demo_ceitec.txt",
  limitLines: process.env.LIMIT_LINES || "20",
};
