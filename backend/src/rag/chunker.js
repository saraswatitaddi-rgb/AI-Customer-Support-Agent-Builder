/**
 * Text Cleaning and Semantic Chunking Engine
 */

/**
 * Clean and normalize text
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into semantic chunks with overlap
 * @param {string} text
 * @param {object} options
 * @returns {Array<{ content: string, chunkIndex: number, metadata: object }>}
 */
function splitIntoChunks(text, options = {}) {
  const {
    chunkSize = 600,
    chunkOverlap = 100,
    metadata = {},
  } = options;

  const cleaned = cleanText(text);
  if (!cleaned) return [];

  // If text is smaller than chunk size, return single chunk
  if (cleaned.length <= chunkSize) {
    return [
      {
        content: cleaned,
        chunkIndex: 0,
        metadata: { ...metadata, charCount: cleaned.length },
      },
    ];
  }

  // Split text by paragraphs first
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length <= chunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
    } else {
      if (currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
          metadata: { ...metadata, charCount: currentChunk.trim().length },
        });

        // Compute overlap from end of currentChunk
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.max(1, Math.floor(chunkOverlap / 6))).join(' ');
        currentChunk = overlapWords ? `${overlapWords} ${para}` : para;
      } else {
        // Single paragraph larger than chunkSize: split by sentences or hard break
        let remaining = para;
        while (remaining.length > 0) {
          const slice = remaining.slice(0, chunkSize);
          chunks.push({
            content: slice.trim(),
            chunkIndex: chunkIndex++,
            metadata: { ...metadata, charCount: slice.trim().length },
          });
          remaining = remaining.slice(chunkSize - chunkOverlap);
          if (remaining.length <= chunkOverlap) break;
        }
        currentChunk = '';
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex: chunkIndex++,
      metadata: { ...metadata, charCount: currentChunk.trim().length },
    });
  }

  return chunks;
}

module.exports = {
  cleanText,
  splitIntoChunks,
};
