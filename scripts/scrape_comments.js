// Scraper Script for HikerAPI Comments
// Usage: node scripts/scrape_comments.js YOUR_HIKER_API_KEY
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("❌ Error: Please provide your HikerAPI access key as an argument.");
  console.error("Usage: node scripts/scrape_comments.js YOUR_HIKER_API_KEY");
  process.exit(1);
}

const targetUrls = [
  "https://www.instagram.com/reel/DTkpqYqisnF/",
  "https://www.instagram.com/reel/DUGiKawis99/",
  "https://www.instagram.com/p/DTS1IoLCjDL/",
  "https://www.instagram.com/p/DSPq8nrCrVY/",
  "https://www.instagram.com/p/DSF0DoXivBU/",
  "https://www.instagram.com/p/DR9vk_hjKIT/",
  "https://www.instagram.com/reel/DRSJIiFiuwY/",
  "https://www.instagram.com/p/DRRsrGhCtGL/",
  "https://www.instagram.com/p/DVoOT2yCipw/",
  "https://www.instagram.com/p/DVyMql2in_H/",
  "https://www.instagram.com/reel/DVy6QQGiheB/",
  "https://www.instagram.com/reel/DV0gXUJiv6V/",
  "https://www.instagram.com/p/DV1X0euiizB/",
  "https://www.instagram.com/reel/DV1pF22iuTm/",
  "https://www.instagram.com/reel/DV3HzVkitFR/",
  "https://www.instagram.com/p/DV310p8jDQ1/",
  "https://www.instagram.com/reel/DV3_lDDjKEb/",
  "https://www.instagram.com/reel/DV4YLQhjMeY/",
  "https://www.instagram.com/reel/DV6c2chiuKz/",
  "https://www.instagram.com/reel/DV6bCflj0ow/",
  "https://www.instagram.com/p/DV84ChqCltg/",
  "https://www.instagram.com/reel/DV_ZLMPCtYz/",
  "https://www.instagram.com/reel/DV9UR_nCrZ4/",
  "https://www.instagram.com/p/DWCNlkaCs04/",
  "https://www.instagram.com/p/DWMpslgiqQi/",
  "https://www.instagram.com/p/DVvddUYClXy/",
  "https://www.instagram.com/p/DWFForNCDhZ/"
];

// Shortcode to ID Converter using BigInt
function shortcodeToMediaId(shortcode) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = 0n;
  for (let i = 0; i < shortcode.length; i++) {
    let char = shortcode[i];
    let index = BigInt(alphabet.indexOf(char));
    if (index === -1n) return null;
    id = (id * 64n) + index;
  }
  return id.toString();
}

const targets = targetUrls.map(url => {
  const codeMatch = url.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  const code = codeMatch ? codeMatch[1] : null;
  const mediaId = code ? shortcodeToMediaId(code) : null;
  return { url, code, mediaId };
}).filter(t => t.code && t.mediaId);

console.log(`📌 Loaded ${targets.length} valid target posts/reels for comments scraping.`);

const allComments = [];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchComments(target, index) {
  const mediaId = target.mediaId;
  const shortcode = target.code;
  const url = `https://api.hikerapi.com/v2/media/comments?id=${mediaId}`;
  
  let retryCount = 0;
  const maxRetries = 3;
  
  console.log(`⏳ [${index + 1}/${targets.length}] Scraping comments for: ${shortcode}`);
  
  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(url, {
        headers: {
          "x-access-key": apiKey,
          "accept": "application/json"
        }
      });
      
      if (response.status === 429) {
        console.warn(`⚠️ Rate Limit (429). Cooling down for 65 seconds...`);
        await sleep(65000);
        retryCount++;
        continue;
      }
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        retryCount++;
        await sleep(2000);
        continue;
      }
      
      const data = await response.json();
      const commentItems = data.response?.comments || [];
      console.log(`✅ Fetched ${commentItems.length} comments for post ${shortcode}.`);
      
      for (const item of commentItems) {
        if (item.user) {
          allComments.push({
            pk: String(item.user.pk),
            username: item.user.username,
            full_name: item.user.full_name || '',
            profile_pic_url: item.user.profile_pic_url || '',
            is_private: !!item.user.is_private,
            is_verified: !!item.user.is_verified,
            text: item.text || '',
            created_at: item.created_at || 0,
            comment_like_count: item.comment_like_count || 0,
            post_code: shortcode,
            post_url: target.url
          });
        }
      }
      return; // Success
    } catch (err) {
      console.error(`❌ Connection Error: ${err.message}`);
      retryCount++;
      await sleep(2000);
    }
  }
  console.error(`❌ Skipped comments for ${shortcode} after retries.`);
}

async function startScrape() {
  const startTime = Date.now();
  for (let i = 0; i < targets.length; i++) {
    await fetchComments(targets[i], i);
    await sleep(300); // polite delay
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Scrape Complete!`);
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`💬 Total Comments Scraped: ${allComments.length}`);
  
  const outputPath = path.join(__dirname, '../src/scrapedComments.json');
  fs.writeFileSync(outputPath, JSON.stringify(allComments, null, 2));
  console.log(`📁 Saved to: ${outputPath}`);
}

startScrape();
