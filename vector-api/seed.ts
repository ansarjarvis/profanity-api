import fs from "fs";
import csv from "csv-parser";
import { Index } from "@upstash/vector";
import dotenv from "dotenv";

dotenv.config();

interface Row {
  text: string;
}

const index = new Index({
  url: process.env.VECTOR_URL,
  token: process.env.VECTOR_TOKEN,
});

async function parseCSV(filePath: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    let rows: Row[] = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}

const STEP = 30;

let seed = async () => {
  let data = await parseCSV("training_data.csv");

  for (let i = 0; i < data.length; i += STEP) {
    let chunk = data.slice(i, i + STEP);

    let formated = chunk.map((row, batchIndex) => ({
      data: row.text,
      id: i + batchIndex,
      metadata: { text: row.text },
    }));

    await index.upsert(formated);
  }
};

seed();
