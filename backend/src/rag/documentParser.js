const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Extracts plain text from various file formats
 * @param {string} filePath
 * @param {string} fileType ('PDF', 'DOCX', 'TXT', 'CSV')
 * @returns {Promise<string>}
 */
async function parseFile(filePath, fileType) {
  const upperType = (fileType || '').toUpperCase();

  switch (upperType) {
    case 'PDF': {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    }

    case 'DOCX': {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    case 'TXT': {
      return fs.readFileSync(filePath, 'utf-8');
    }

    case 'CSV': {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Convert CSV rows into human-readable sentences for semantic chunking
      const lines = content.split('\n').filter(Boolean);
      if (lines.length <= 1) return content;
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const textRows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowDesc = headers.map((h, idx) => `${h}: ${values[idx] || 'N/A'}`).join(', ');
        textRows.push(rowDesc);
      }
      return textRows.join('\n');
    }

    default:
      return fs.readFileSync(filePath, 'utf-8');
  }
}

/**
 * Scrapes readable text from a website URL
 * @param {string} url
 * @returns {Promise<string>}
 */
async function scrapeUrlContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AICustomerSupportAgentBuilder/1.0',
      },
    });

    const html = response.data;
    if (typeof html !== 'string') return '';

    // Strip scripts, styles, HTML tags, decode common entities
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 50000); // cap to 50k chars
  } catch (err) {
    logger.error(`Error scraping URL ${url}:`, err.message);
    throw new Error(`Failed to fetch content from URL: ${err.message}`);
  }
}

/**
 * Format FAQ into structured knowledge text
 * @param {string} question
 * @param {string} answer
 * @returns {string}
 */
function formatFaqText(question, answer) {
  return `Frequently Asked Question:
Q: ${question.trim()}
A: ${answer.trim()}`;
}

/**
 * Format product catalog into structured knowledge text
 * @param {object} product
 * @returns {string}
 */
function formatProductText(product) {
  return `Product: ${product.name}
Category: ${product.category}
Price: ₹${product.price}${product.unit ? ` (${product.unit})` : ''}
Stock: ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
Description: ${product.description}`;
}

module.exports = {
  parseFile,
  scrapeUrlContent,
  formatFaqText,
  formatProductText,
};
