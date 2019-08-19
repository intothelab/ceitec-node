// tslint:disable: no-console prefer-const array-type

import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
// import path from "path";

interface IFile {
  id: string;
  timestamp: string;
  antenna: string;
}

const errorHandler = (error: any) => {
  let message = error.message;
  let timestamp = new Date().toISOString();

  console.log(`${timestamp}: ${message}`);
};

const asyncForEach = async (arr: any, cb: any) => {
  for (let index = 0; index < arr.length; index++) {
    await cb(arr[index], index, arr);
  }
};

const parseLine = (line: Array<string>) => {
  return {
    id: line[0],
    timestamp: line[1],
    antenna: line[2],
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
    .then((response: AxiosResponse) => console.log("OK"))
    .catch((error: AxiosError) => errorHandler(error));

  // console.log(data);
};

const processFile = async (error: any, file: any) => {
  if (error) {
    errorHandler(error);
  }

  sendToServer(await parseFile(file));
};

setInterval(() => {
  const file = "C:\\RAUL\\log_demo_ceitec.txt"; // path.join(__dirname, "../example.txt");

  fs.readFile(file, "utf8", processFile);
}, 15000);
