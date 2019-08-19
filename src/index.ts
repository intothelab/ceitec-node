import axios, { AxiosError, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import * as cron from "node-cron";
import fs from "fs";
import path from "path";

axiosRetry(axios, { retries: 3 });
axios.defaults.withCredentials = true;

interface IFile {
  id: string;
  timestamp: string;
  antenna: string;
};

const asyncForEach = async (arr: any, cb: any) => {
  for (let index = 0; index < arr.length; index++) {
    await cb(arr[index], index, arr);
  }
}

const errorHandler = (error: any) => {
  console.log(error);
}

const parseLine = (line: Array<string>) => {
  return {
    "id": line[0],
    "timestamp": line[1],
    "antenna": line[2],
  };
};

const parseFile = async (file: any) => {
  let lines: Array<string> = file.split("\n") || [];
  let arr = [];

  lines.shift();

  await asyncForEach(lines, (line: string) => {
    let current = line.split(",");

    if (current.length === 3) {
      arr.push(parseLine(current));
    }
  });

  return arr;
};

const sendToServer = (data: Array<IFile>) => {
  axios.post("http://localhost:3000", data)
    .then((response: AxiosResponse) => console.log('OK'))
    .catch((error: AxiosError) => errorHandler(error));
};

const processFile = async (error: any, file: any) => {
  if (error) {
    errorHandler(error);
  }

  sendToServer(await parseFile(file));
};

const readFile = () => {
  const file = path.join(__dirname, "../example.txt");

  fs.readFile(file, "utf8", processFile);
};

cron.schedule("0 */1 * * * *", () => {
  readFile();
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo",
});