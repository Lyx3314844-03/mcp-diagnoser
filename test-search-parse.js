/**
 * Test search result parsing
 */

const testHtml = `
<!DOCTYPE html>
<html>
<head><title>Test Search Results</title></head>
<body>
  <div class="result">
    <a class="result__a" href="https://baike.baidu.com/item/奥特曼/123456">奥特曼_百度百科</a>
    <a class="result__snippet">奥特曼是日本圆谷株式会社制作进而衍生出的日本特摄英雄的总称...</a>
  </div>
  <div class="result">
    <a class="result__a" href="https://www.bilibili.com/video/BV123456">奥特曼系列视频</a>
    <a class="result__snippet">哔哩哔哩 - 奥特曼全集在线观看...</a>
  </div>
  <div class="result">
    <a class="result__a" href="https://i0.hdslb.com/bfs/static/test.png">CDN 图片</a>
  </div>
  <div class="result">
    <a class="result__a" href="https://www.google.com/search?q=test">Google 搜索</a>
  </div>
  <div class="result">
    <a class="result__a" href="http://schemas.live.com/Web/">Live Schema</a>
  </div>
</body>
</html>
`;

// Test parsing
const blockedDomains = [
  'google.com', 'bing.com', 'duckduckgo.com',
  'w3.org', 'live.com', 'cloudflare.com',
  'schemas.live.com', 'storage.live.com',
  'microsoft.com', 'gstatic.com', 'googleusercontent.com',
  'hdslb.com', 'bilibili.com',
  'youtube.com', 'ytimg.com',
];

const selector = {
  pattern: /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
  title: /<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]{0,200}?)<\/a>/i,
  url: /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>/i,
  snippet: /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]{0,300}?)<\/a>/i,
};

const containers = [];
let match;

while ((match = selector.pattern.exec(testHtml)) !== null) {
  containers.push(match[0]);
}

console.log(`Found ${containers.length} containers\n`);

const results = [];
const seenUrls = new Set();

for (const container of containers) {
  let title = '';
  const titleMatch = container.match(selector.title);
  if (titleMatch) {
    title = titleMatch[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
  }
  
  let url = '';
  const urlMatch = container.match(selector.url);
  if (urlMatch) {
    url = urlMatch[1];
  }
  
  let snippet = '';
  const snippetMatch = container.match(selector.snippet);
  if (snippetMatch) {
    snippet = snippetMatch[1]
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  
  console.log(`Title: "${title}"`);
  console.log(`URL: "${url}"`);
  console.log(`Snippet: "${snippet}"`);
  
  // Check if valid
  const isValid = url && 
                  url.startsWith('http') &&
                  !blockedDomains.some(d => url.includes(d)) &&
                  !url.includes('{') &&
                  !seenUrls.has(url);
  
  console.log(`Valid: ${isValid}\n`);
  
  if (isValid) {
    seenUrls.add(url);
    results.push({ title, url, snippet });
  }
}

console.log(`\n=== Final Results (${results.length}) ===`);
results.forEach((r, i) => {
  console.log(`${i + 1}. ${r.title}`);
  console.log(`   ${r.url}`);
});
