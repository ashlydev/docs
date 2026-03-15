type ChunkOptions = {
  maxChars?: number;
  overlapChars?: number;
  minBlockChars?: number;
};

export type TextChunk = {
  text: string;
  tokenEstimate: number;
};

const SENTENCE_BOUNDARY_REGEX = /(?<=[.?!])\s+(?=[A-Z0-9])/;

function normalizeText(input: string) {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function buildOverlap(text: string, overlapChars: number) {
  if (text.length <= overlapChars) {
    return text;
  }

  const tail = text.slice(-overlapChars);
  const firstSpace = tail.indexOf(" ");

  return tail.slice(firstSpace > -1 ? firstSpace + 1 : 0).trim();
}

function splitOversizedBlock(block: string, maxChars: number) {
  const sentences = block
    .split(SENTENCE_BOUNDARY_REGEX)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const slices: string[] = [];

    for (let index = 0; index < block.length; index += maxChars) {
      slices.push(block.slice(index, index + maxChars).trim());
    }

    return slices.filter(Boolean);
  }

  const parts: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    if (!buffer) {
      buffer = sentence;
      continue;
    }

    if (buffer.length + sentence.length + 1 <= maxChars) {
      buffer = `${buffer} ${sentence}`;
      continue;
    }

    parts.push(buffer.trim());
    buffer = sentence;
  }

  if (buffer.trim()) {
    parts.push(buffer.trim());
  }

  return parts.filter(Boolean);
}

export function chunkDocument(
  text: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const maxChars = options.maxChars ?? 1200;
  const overlapChars = options.overlapChars ?? 180;
  const minBlockChars = options.minBlockChars ?? 60;
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length >= minBlockChars);

  const blocks = rawBlocks.flatMap((block) =>
    block.length > maxChars ? splitOversizedBlock(block, maxChars) : [block]
  );

  const chunks: TextChunk[] = [];
  let buffer = "";

  for (const block of blocks) {
    if (!buffer) {
      buffer = block;
      continue;
    }

    if (buffer.length + block.length + 2 <= maxChars) {
      buffer = `${buffer}\n\n${block}`;
      continue;
    }

    const textChunk = buffer.trim();
    chunks.push({
      text: textChunk,
      tokenEstimate: estimateTokens(textChunk)
    });

    const overlap = buildOverlap(textChunk, overlapChars);
    buffer = overlap ? `${overlap}\n\n${block}` : block;
  }

  if (buffer.trim()) {
    const textChunk = buffer.trim();
    chunks.push({
      text: textChunk,
      tokenEstimate: estimateTokens(textChunk)
    });
  }

  return chunks.filter((chunk) => chunk.text.length >= minBlockChars);
}
