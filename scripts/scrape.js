// Production Scraper Script for HikerAPI
// Usage: node scripts/scrape.js YOUR_HIKER_API_KEY
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("❌ Error: Please provide your HikerAPI access key as an argument.");
  console.error("Usage: node scripts/scrape.js YOUR_HIKER_API_KEY");
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

// Convert all URLs to codes/media IDs
const targets = targetUrls.map(url => {
  const codeMatch = url.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  const code = codeMatch ? codeMatch[1] : null;
  const mediaId = code ? shortcodeToMediaId(code) : null;
  return { url, code, mediaId };
}).filter(t => t.code && t.mediaId);

console.log(`📌 Loaded ${targets.length} valid target posts/reels.`);

// Master database map keyed by user ID (pk)
const masterUsersMap = new Map();

// Helper to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchLikers(target, index) {
  const mediaId = target.mediaId;
  const shortcode = target.code;
  const url = `https://api.hikerapi.com/v2/media/likers?id=${mediaId}`;
  
  let retryCount = 0;
  const maxRetries = 5;
  
  console.log(`\n⏳ [${index + 1}/${targets.length}] Scraping likers for code: ${shortcode} (ID: ${mediaId})`);
  
  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(url, {
        headers: {
          "x-access-key": apiKey,
          "accept": "application/json"
        }
      });
      
      if (response.status === 429) {
        console.warn(`⚠️ Rate Limit (429) hit! Cooling down for 65 seconds...`);
        await sleep(65000);
        retryCount++;
        continue;
      }
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        retryCount++;
        await sleep(5000);
        continue;
      }
      
      const data = await response.json();
      const rawUsers = data.users || data.items || data || [];
      
      if (!Array.isArray(rawUsers)) {
        console.error("❌ Unexpected response schema (not an array/list):", JSON.stringify(data).substring(0, 100));
        return 0;
      }
      
      console.log(`✅ Successfully fetched ${rawUsers.length} likers for post ${shortcode}.`);
      
      // Process and merge into master database
      rawUsers.forEach(u => {
        const pk = u.pk || u.id || u.user_pk;
        if (!pk) return;
        
        if (masterUsersMap.has(pk)) {
          const existing = masterUsersMap.get(pk);
          if (!existing.likedPostIds.includes(mediaId)) {
            existing.likedPostIds.push(mediaId);
            existing.likedPostsCount = existing.likedPostIds.length;
            existing.recent_activity += `, Liked "${shortcode}"`;
          }
        } else {
          masterUsersMap.set(pk, {
            pk: pk,
            username: u.username,
            full_name: u.full_name || "",
            profile_pic_url: u.profile_pic_url || "",
            is_private: !!u.is_private,
            is_verified: !!u.is_verified,
            bio: u.biography || u.bio || "",
            likedPostIds: [mediaId],
            likedPostsCount: 1,
            recent_activity: `Liked "${shortcode}"`
          });
        }
      });
      
      return rawUsers.length;
      
    } catch (error) {
      console.error(`❌ Connection error: ${error.message}`);
      retryCount++;
      await sleep(5000);
    }
  }
  
  console.error(`❌ Skipped post ${shortcode} after ${maxRetries} failed retries.`);
  return 0;
}

async function startScrapeProcess() {
  const startTime = Date.now();
  
  for (let i = 0; i < targets.length; i++) {
    await fetchLikers(targets[i], i);
    // Respect API usage buffer rate limit
    await sleep(2000);
  }
  
  const finalUsersList = Array.from(masterUsersMap.values());
  
  // Sort list by likedPostsCount descending
  finalUsersList.sort((a, b) => b.likedPostsCount - a.likedPostsCount);
  
  const outputFilePath = path.join(__dirname, '../src/scrapedUsers.json');
  fs.writeFileSync(outputFilePath, JSON.stringify(finalUsersList, null, 2));
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Scrape Complete!`);
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`👥 Total Deduplicated Profiles: ${finalUsersList.length}`);
  console.log(`📁 Saved to: ${outputFilePath}`);
}

startScrapeProcess();
