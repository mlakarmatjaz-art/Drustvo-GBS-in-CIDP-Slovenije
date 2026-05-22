import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const targetDir = process.argv[2] || './knowledge';

async function main() {
  const absoluteDir = path.resolve(targetDir);
  const files = fs.readdirSync(absoluteDir)
    .filter((name) => !name.startsWith('.'))
    .map((name) => path.join(absoluteDir, name))
    .filter((full) => fs.statSync(full).isFile());

  if (!files.length) {
    throw new Error(`V mapi ${absoluteDir} ni datotek.`);
  }

  const vectorStore = await client.vectorStores.create({
    name: 'Društvo GBS in CIDP Slovenije knowledge base'
  });

  const fileStreams = files.map((filePath) => fs.createReadStream(filePath));
  await client.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams);

  console.log('VECTOR_STORE_ID=' + vectorStore.id);
  console.log('Naloženih datotek: ' + files.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
