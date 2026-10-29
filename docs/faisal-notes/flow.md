# Flow

## Sections

1. Discovery
   1. ~100 sports
   2. Options for running
      1. Every state
         1. Every month: all 50 states so ~5,000 state-sport combinations
         2. Expected total: ~60,000 runs per year, ~5,000 runs per month, ~8 runs per hour
      2. Every city
         1. Every month: major cities (~330) so ~33,000 city-sport combinations
         2. Every year: all other cities (~19,500) so ~1,950,000 city-sport combinations
         3. Expected total: ~2,000,000 runs per year, ~200,000 runs per month, ~230 runs per hour
      3. Every county (monthly)
         1. Every month: all ~3,144 counties so ~314,400 county-sport combinations
         2. Expected total: ~3,150,000 runs per year, ~315,000 runs per month, ~365 runs per hour
      4. Every county (yearly)
         1. Every year: all ~3,144 counties so ~314,400 county-sport combinations
         2. Expected total: ~315,000 runs per year, ~30,000 runs per month, ~40 runs per hour
      5. Every county (quarterly), every city (biannually), every state (monthly)
         1. Expected total: ~175,000 runs per month, ~90,000 runs per day, ~8,000 runs per hour
   3. All need Web search, URL crawling, and data processing
   4. Compare searching by state, county, city to see how results compare.
2. Validation
   1. Validate all entries in the database
   2. 2880 organizations
   3. 900 programs
   4. 45 grants
   5. 3825 total searches, all needing URL crawling and data processing

## Stages

1. Web search: Use a service to search the web and return URLs.
   - Possible services:
     - Gemini Web Search
       - Built-in grounding
       - Use batching
       - Changes input price from free to $0.15 per million tokens
       - Changes output price from free to $1.25 per million tokens
       - Free 5,000 searches per month
       - $14 per 1,000 searches after that
     - Searlo
       - Search only, no extract
       - Credit bundles
       - $4 for 5,000 credits
       - $10 for 20,000 credits
       - $30 for 75,000 credits
       - $75 for 250,000 credits
     - Kagi
       - Search and extract
       - $12 per 1,000 searches
       - $4 per 1,000 extractions
     - Brave Search API
       - Search and extract
       - $5 per 1,000 searches
       - $4 per 1,000 extractions + $5 per million tokens
   - Verdict: Searlo
2. URL crawling: Crawl the returned URLs to return content from all site pages.
   - Possible services: Cloudflare with open-source crawler
   - Verdict: Cloudflare with open-source crawler
3. Data processing: Convert site content into JSON structured data.
   - Possible services: Gemini
   - Verdict: Gemini
