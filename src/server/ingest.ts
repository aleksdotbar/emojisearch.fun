import emojilib from "emojilib";

const VECTOR_UPSERT_BATCH_SIZE = 500;

type EmojiEntry = {
  id: string;
  keywords: Array<string>;
  text: string;
};

export function getEmojiEntries(): Array<EmojiEntry> {
  return Object.entries(emojilib).map(([id, keywords]) => ({
    id,
    keywords,
    text: `${id}: ${keywords.join(" ")}`,
  }));
}

export async function upsertVectors(index: VectorizeIndex, vectors: Array<VectorizeVector>) {
  for (let i = 0; i < vectors.length; i += VECTOR_UPSERT_BATCH_SIZE) {
    await index.upsert(vectors.slice(i, i + VECTOR_UPSERT_BATCH_SIZE));
  }
}
