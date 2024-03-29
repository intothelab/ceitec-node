// tslint:disable: no-console prefer-const array-type

import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import config from "./config";

interface IFile {
  id: string;
  timestamp: string;
  antenna: string;
}

const responseHandler = (response: AxiosResponse) => {
  let status = response.status;
  let message = response.data.message || response.statusText;
  let timestamp = new Date().toISOString();

  console.log(`${timestamp}: [${status}] ${message}`);
};

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
  let timestamp = new Date().toISOString();
  let lines: Array<string> = file.split("\n") || [];
  let arr = [];

  lines = lines.filter((line: any) => line);

  lines.shift();

  if (lines.length > parseInt(config.limitLines, 10)) {
    lines = lines.slice(parseInt(config.limitLines, 10) * -1);
  }

  console.log(`${timestamp}: Total de linhas: ${lines.length}.`);

  await asyncForEach(lines, (line: string) => {
    let current = line.split(",");

    if (current.length === 3) {
      arr.push(parseLine(current));
    }
  });

  return arr;
};

const sendToServer = (data: Array<IFile>) => {
  let timestamp = new Date().toISOString();

  console.log(`${timestamp}: Enviando dados para o servidor...`);

  axios.post(config.apiUrl, { data })
    .then((response: AxiosResponse) => responseHandler(response))
    .catch((error: AxiosError) => errorHandler(error));
};

const processFile = async (error: any, file: any) => {
  if (error) {
    errorHandler(error);
  }

  sendToServer(await parseFile(file));
};

const filePath = path.win32.join(config.filePath);

fs.watch(filePath, (event, filename) => {
  let timestamp = new Date().toISOString();

  console.log(`${timestamp}: Arquivo alterado! Processando...`);

  fs.readFile(filePath, "utf8", processFile);
});
