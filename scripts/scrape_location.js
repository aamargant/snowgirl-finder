// Scraper Script for HikerAPI Location & Hashtag Media (Grandvalira & Snowrow)
// Usage: node scripts/scrape_location.js YOUR_HIKER_API_KEY
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("❌ Error: Please provide your HikerAPI access key as an argument.");
  console.error("Usage: node scripts/scrape_location.js YOUR_HIKER_API_KEY");
  process.exit(1);
}

const locations = [
  { id: "105635776137112", name: "Grandvalira" },
  { id: "248565812", name: "Grau Roig" },
  { id: "1528497887251991", name: "Grandvalira - Grau Roig" },
  { id: "395533627588536", name: "Soldeu Grandvalira" },
  { id: "176151936637168", name: "El Tarter - Grandvalira" },
  { id: "1926787424307023", name: "Pas de la Casa" }
];

const hashtags = ["snowrow", "snowrowfestival", "snowrowandorra"];

const FESTIVAL_START = new Date("2026-03-12T00:00:00Z").getTime();
const FESTIVAL_END = new Date("2026-03-16T23:59:59Z").getTime();

console.log(`📌 Target Date Range: March 12 to March 16, 2026`);

const masterPostsMap = new Map();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeLocation(loc) {
  let nextMaxId = "";
  let page = 1;
  let reachedBeforeFestival = false;
  
  console.log(`\n🚀 Starting chronological crawl for Location [${loc.name}] (ID: ${loc.id})...`);
  
  while (!reachedBeforeFestival) {
    let url = `https://api.hikerapi.com/v1/location/medias/recent/chunk?location_pk=${loc.id}`;
    if (nextMaxId) {
      url += `&max_id=${encodeURIComponent(nextMaxId)}`;
    }
    
    console.log(`⏳ [${loc.name}] Fetching Page ${page}...`);
    
    try {
      const res = await fetch(url, { headers: { "x-access-key": apiKey } });
      if (res.status === 429) {
        console.warn("⚠️ Rate Limit (429). Cooling down for 65s...");
        await sleep(65000);
        continue;
      }
      if (!res.ok) {
        console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
        await sleep(5000);
        continue;
      }
      
      const data = await res.json();
      const items = data[0] || [];
      const nextMaxIdVal = data[1] || "";
      
      if (items.length === 0) {
        console.log(`ℹ️ [${loc.name}] No more items returned by API.`);
        break;
      }
      
      console.log(`✅ [${loc.name}] Loaded ${items.length} posts on page ${page}.`);
      
      let newestDateStr = items[0]?.taken_at || "";
      let oldestDateStr = items[items.length - 1]?.taken_at || "";
      console.log(`📅 Date range: ${newestDateStr} down to ${oldestDateStr}`);
      
      for (const item of items) {
        const takenTime = new Date(item.taken_at).getTime();
        
        if (takenTime < FESTIVAL_START) {
          reachedBeforeFestival = true;
        }
        
        if (takenTime >= FESTIVAL_START && takenTime <= FESTIVAL_END) {
          let imageUrl = "";
          if (item.image_versions && item.image_versions.candidates && item.image_versions.candidates.length > 0) {
            imageUrl = item.image_versions.candidates[0].url;
          } else if (item.thumbnail_url) {
            imageUrl = item.thumbnail_url;
          }
          
          if (!masterPostsMap.has(item.pk)) {
            masterPostsMap.set(item.pk, {
              pk: item.pk,
              code: item.code,
              taken_at: item.taken_at,
              like_count: item.like_count || 0,
              comment_count: item.comment_count || 0,
              post_photo: imageUrl,
              caption: item.caption_text || '',
              location_name: loc.name,
              user: {
                pk: String(item.user?.pk),
                username: item.user?.username,
                full_name: item.user?.full_name || '',
                profile_pic_url: item.user?.profile_pic_url || '',
                is_private: !!item.user?.is_private
              }
            });
          }
        }
      }
      
      nextMaxId = nextMaxIdVal;
      if (!nextMaxId) {
        console.log(`ℹ️ [${loc.name}] Pagination finished.`);
        break;
      }
      
      page++;
      await sleep(1000); // Polite delay
      
    } catch (err) {
      console.error(`❌ Connection Error: ${err.message}`);
      await sleep(3000);
    }
  }
}

async function scrapeHashtag(tag) {
  let nextMaxId = "";
  let page = 1;
  
  console.log(`\n🚀 Starting top crawl for Hashtag [#${tag}]...`);
  
  while (page <= 5) { // Top posts do not sort chronologically, inspect up to 5 pages
    let url = `https://api.hikerapi.com/v1/hashtag/medias/top/chunk?name=${tag}`;
    if (nextMaxId) {
      url += `&max_id=${encodeURIComponent(nextMaxId)}`;
    }
    
    console.log(`⏳ [#${tag}] Fetching Page ${page}...`);
    
    try {
      const res = await fetch(url, { headers: { "x-access-key": apiKey } });
      if (res.status === 429) {
        console.warn("⚠️ Rate Limit (429). Cooling down for 65s...");
        await sleep(65000);
        continue;
      }
      if (!res.ok) {
        console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
        await sleep(5000);
        continue;
      }
      
      const data = await res.json();
      const items = data[0] || [];
      const nextMaxIdVal = data[1] || "";
      
      if (items.length === 0) {
        console.log(`ℹ️ [#${tag}] No items returned.`);
        break;
      }
      
      console.log(`✅ [#${tag}] Loaded ${items.length} posts on page ${page}.`);
      
      let matches = 0;
      for (const item of items) {
        const takenTime = new Date(item.taken_at).getTime();
        
        if (takenTime >= FESTIVAL_START && takenTime <= FESTIVAL_END) {
          let imageUrl = "";
          if (item.image_versions && item.image_versions.candidates && item.image_versions.candidates.length > 0) {
            imageUrl = item.image_versions.candidates[0].url;
          } else if (item.thumbnail_url) {
            imageUrl = item.thumbnail_url;
          }
          
          if (!masterPostsMap.has(item.pk)) {
            matches++;
            masterPostsMap.set(item.pk, {
              pk: item.pk,
              code: item.code,
              taken_at: item.taken_at,
              like_count: item.like_count || 0,
              comment_count: item.comment_count || 0,
              post_photo: imageUrl,
              caption: item.caption_text || '',
              location_name: `#${tag} (Hashtag)`,
              user: {
                pk: String(item.user?.pk),
                username: item.user?.username,
                full_name: item.user?.full_name || '',
                profile_pic_url: item.user?.profile_pic_url || '',
                is_private: !!item.user?.is_private
              }
            });
          }
        }
      }
      
      console.log(`🎯 Found ${matches} festival date matches on page ${page}.`);
      
      nextMaxId = nextMaxIdVal;
      if (!nextMaxId) {
        console.log(`ℹ️ [#${tag}] Pagination finished.`);
        break;
      }
      
      page++;
      await sleep(1000);
      
    } catch (err) {
      console.error(`❌ Connection Error: ${err.message}`);
      await sleep(3000);
    }
  }
}

async function startScrape() {
  const startTime = Date.now();
  
  // 1. Scrape location sectors
  for (const loc of locations) {
    await scrapeLocation(loc);
    await sleep(2000);
  }
  
  // 2. Scrape hashtags
  for (const tag of hashtags) {
    await scrapeHashtag(tag);
    await sleep(2000);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Scrape Complete!`);
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`📍 Total Deduplicated Location & Hashtag Posts Scraped: ${masterPostsMap.size}`);
  
  const outputList = Array.from(masterPostsMap.values());
  const outputPath = path.join(__dirname, '../src/scrapedLocationPosts.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputList, null, 2));
  console.log(`📁 Saved to: ${outputPath}`);
}

startScrape();
