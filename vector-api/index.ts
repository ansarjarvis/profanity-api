import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { Index } from "@upstash/vector";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

type Environment = {
  VECTOR_TOKEN: string;
  VECTOR_URL: string;
};

const WHITELIST = ["swear"];
const PROFANITY_THRESHOLD = 0.86;

let sementicSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 25,
  separators: [" "],
  chunkOverlap: 8,
});

/* configuration */

let app = new Hono();
app.use(cors());

/* routes */

app.post("/", async (c) => {
  if (c.req.header("Content-Type") !== "application/json") {
    c.json({ error: "Json body expected" }, { status: 406 });
  }

  try {
    let { VECTOR_URL, VECTOR_TOKEN } = env<Environment>(c);

    let index = new Index({
      url: VECTOR_URL,
      token: VECTOR_TOKEN,
      cache: false,
    });

    let body = await c.req.json();
    let { message } = body as { message: string };

    if (!message) {
      return c.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.split(/\s/).length > 35 || message.length > 1000) {
      return c.json(
        {
          error: "Message can only be at most 1000 charecters",
        },
        { status: 413 }
      );
    }

    message = message
      .split(/\s/)
      .filter((word) => !WHITELIST.includes(word.toLowerCase()))
      .join(" ");

    let [sementicChunks, wordChunks] = await Promise.all([
      splitTextIntoSementics(message),
      splitTextIntoWords(message),
    ]);

    let flaggedFor = new Set<{ score: number; text: string }>();
    let vectorRes = await Promise.all([
      ...wordChunks.map(async (wordChunk) => {
        let [vector] = await index.query({
          topK: 1,
          data: wordChunk,
          includeMetadata: true,
        });
        if (vector && vector.score > 0.95) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }
        return { score: 0 };
      }),

      ...sementicChunks.map(async (sementicChunk) => {
        let [vector] = await index.query({
          topK: 1,
          data: sementicChunk,
          includeMetadata: true,
        });
        if (vector && vector.score > PROFANITY_THRESHOLD) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }
        return vector!;
      }),
    ]);

    if (flaggedFor.size > 0) {
      let sorted = Array.from(flaggedFor).sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0];
      return c.json({
        isProfanity: true,
        score: sorted?.score,
        flaggedFor: sorted?.text,
      });
    } else {
      let mostProfaneChuck = vectorRes.sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0]!;
      return c.json({
        isProfanity: false,
        score: mostProfaneChuck.score,
      });
    }
  } catch (err) {
    console.error(err);

    return c.json(
      {
        error: "Something went wrong",
        err: JSON.stringify(err),
      },
      { status: 500 }
    );
  }
});

function splitTextIntoWords(text: string) {
  return text.split(/\s/);
}

async function splitTextIntoSementics(text: string): Promise<string[]> {
  if (text.split(/\s/).length === 1) return [];
  let document = await sementicSplitter.createDocuments([text]);
  let chunks = document.map((chunk) => chunk.pageContent);
  return chunks;
}

export default app;
