# Data fix: tennis listings whose website is a general USTA page

For Faisal (data). Alec, 2026-10-17: "I want him to focus on the data part, we focus on front end."
Found from Alec's question on the GLASA tennis listing: "GLASA Website should go to glasa.org not usta.com?"

## What's wrong

69 tennis listings use a general USTA page as their website instead of the program's own page:

- `https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html` (68 listings)
- `https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are` (1 listing)

Both pages are about adaptive tennis nationally and say nothing about the program. Anyone who taps
**Visit website** on one of these listings lands on the same USTA page, a dead end for finding the program.
They look like one USTA program list brought in together.

- `asnm-db-staging`: 68 of them. `asnm-db` (live): 69. The ids are the same in both.
- The extra live row, Special Olympics Virginia Beach (`612a0cb2`), is no longer in staging.
- Full list with complete ids and URLs: [`usta-generic-websites.csv`](usta-generic-websites.csv).

## What to do (your call)

For each row, the program's own page: its website, or its page on the body that runs it (a Special Olympics
area page, a park district page, a `playtennis.usta.com/<club>` page). If a program has no page of its own,
clearing the website is better than the general page: a listing with no website shows **Suggest a website**
instead of **Visit website**, so a visitor isn't sent somewhere unhelpful.

To see the current rows:

```sql
SELECT id, name, city, state, website_url FROM organizations
WHERE website_url LIKE '%usta.com/en/home/about-usta/%' ORDER BY state, name;
```

## The list (by state)

| Name | City | ID | Staging | Live |
|---|---|---|---|---|
| Youth Development Association, Inc. | Huntsville, AL | `bb43fd3e` | yes | yes |
| Special Olympics Arkansas Area 7 | Jonesboro, AR | `cddf03c9` | yes | yes |
| Youth on Court | Scottsdale, AZ | `45c6e5e0` | yes | yes |
| Adapted Physical Education | Danbury, CT | `bfc08d71` | yes | yes |
| Agape Tennis Foundation | Atlanta, GA | `624ac7a1` | yes | yes |
| South Atlanta Community Tennis Association | College Park / Fulton County, GA | `d00f219b` | yes | yes |
| Bunny's Buddies (is with the Central Iowa Tennis Alliance) | Adel, IA | `0bd36c4a` | yes | yes |
| Independent North, Algona-Dyson Special Olympics Tennis | Algona, IA | `480c6535` | yes | yes |
| Nancy's Stars | Bluegrass, IA | `1124638c` | yes | yes |
| Smart DMS | Des Moines, IA | `d9feb281` | yes | yes |
| USTA Iowa Allstars | Clinton, IA | `24b7208b` | yes | yes |
| Orofino Community Tennis | Orofino, ID | `f7dee15a` | yes | yes |
| Adaptive Tennis at Marquette Park | Chicago, IL | `ab76317d` | yes | yes |
| iCan Dream Tennis | Homewood, IL | `c0daf07d` | yes | yes |
| Lincoln Way Area Tennis | Mokena, IL | `65989bab` | yes | yes |
| Midwest Unified Doubles Showdown | Homewood, IL | `daedc1e2` | yes | yes |
| Tennis for Veterans | Chicago, IL | `8ffda8ce` | yes | yes |
| Tiebreaks | Park Forest, IL | `abf7bfa9` | yes | yes |
| Buddy Up Tennis | South Bend, IN | `471bc83f` | yes | yes |
| CBTP Adaptive Tennis Club of Topeka | Topeka, KS | `04ec1d9e` | yes | yes |
| Tennis For All | Fort Riley, KS | `2606b978` | yes | yes |
| Warriors in Transition | Fort Riley, KS | `b0cd94c4` | yes | yes |
| FEAT: Autism Camp | Louisville, KY | `a17e84df` | yes | yes |
| Special Populations, FEAT | Louisville, KY | `4e93f1f4` | yes | yes |
| Handi-Racket Tennis | Wayland, MA | `fadb07f8` | yes | yes |
| Bennett Blazers Tennis | Baltimore, MD | `068e6504` | yes | yes |
| Accelerate4KIDS | Novi, MI | `f5e45171` | yes | yes |
| Adaptive Play Day | Holland, MI | `1b916ec6` | yes | yes |
| Bay City Unified Adaptive Tennis | Bay City, MI | `64402e8c` | yes | yes |
| Free Community Event | See website / multiple locations, MI | `5c397e74` | yes | yes |
| West Michigan Community Tennis | Grandville, MI | `cce71058` | yes | yes |
| Hibbing-Chisholm Rangers Special Olympics | Hibbing, MN | `bbf69234` | yes | yes |
| Missouri School for the Blind | St. Louis, MO | `c438c01d` | yes | yes |
| St. Louis Indoor Para-Tennis Championships | St. Louis, MO | `85f96e48` | yes | yes |
| Battlefield BVI Tennis | Jackson, MS | `81d10726` | yes | yes |
| Love United Adaptive Tennis | Meridian, MS | `7a61af4f` | yes | yes |
| Meridian Roll and Run Adaptive Tennis | Meridian, MS | `14dc137e` | yes | yes |
| Count Me In, Inc. | Exeter, Hampton, NH | `a5833071` | yes | yes |
| Adaptive Tennis US | Lawrenceville, NJ | `26180418` | yes | yes |
| Buddy Up Tennis | Princeton, NJ | `347811d3` | yes | yes |
| Police Athletic League | Atlantic City, NJ | `81f8a714` | yes | yes |
| Adaptive Tennis and Fitness | Dix Hills, NY | `a63d31d5` | yes | yes |
| Adaptive Tennis for Students with Autism | Jamaica, NY | `9a5831db` | yes | yes |
| Beautiful People Adaptive Sports | New Windsor, NY | `02c18263` | yes | yes |
| Brooklyn Youth Tennis Association, Inc. | Brooklyn, NY | `64cc19ee` | yes | yes |
| NEYSA TENNIS | Dix Hills, NY | `15f01301` | yes | yes |
| Serving Heroes | Kings Park, Northport, NY | `618343a6` | yes | yes |
| SPIRIT Tennis | Blauvelt, NY | `247531e5` | yes | yes |
| Walnut Hills Outreach | Cincinnati, OH | `ee4c384e` | yes | yes |
| Bridge Creek Early Childhood | Blanchard, OK | `8d3f5ca5` | yes | yes |
| Lake Oswego Tennis Center Special Olympics | Lake Oswego, OR | `0a8df763` | yes | yes |
| BSO BVI Tennis | Philadelphia, PA | `2f78da3f` | yes | yes |
| Cheltenham Youth Tennis | Wyncote, PA | `12519b06` | yes | yes |
| Delco Special Olympics | Haverford, PA | `1d689db8` | yes | yes |
| Highland Park Tennis Club | Pittsburgh, PA | `6e98e890` | yes | yes |
| Legacy Youth Tennis and Education | Philadelphia, PA | `cfbc3ae3` | yes | yes |
| Love Serving Autism | Allentown, PA | `2886709e` | yes | yes |
| Matchpoint Tennis Social Club | Philadelphia, PA | `09702970` | yes | yes |
| Aunt Nettie's Fault Special Olympics Tennis | Columbia, SC | `5c1ce4e5` | yes | yes |
| Exceptional Islanders Tennis | John's Island, SC | `c86cec63` | yes | yes |
| Special Olympics Greenville (Area 4) | Greenville, SC | `76284d2e` | yes | yes |
| Adaptive Tennis Kick-Off Event | Blacksburg, VA | `d0161778` | yes | yes |
| MAPLE'S Kids (Multiple Adaptive Play Experiences in Sports) | Salem, VA | `d4561d86` | yes | yes |
| Special Olympics Virginia Beach | Virginia Beach, VA | `612a0cb2` | no | yes |
| EXPO Tennis | Enumclaw, WA | `f2038dc6` | yes | yes |
| Lakeland Area Special Olympics | Minocqua, WI | `6d6ae8ab` | yes | yes |
| Grayhound Youth Sports | Northfork, WV | `1bfd588f` | yes | yes |
| I Play Tennis, Inc. | Huntington, Ona, WV | `af1c0265` | yes | yes |
| Alpine Adaptive Tennis | Laramie, WY | `7ef623f9` | yes | yes |

## Not on the list (USTA pages about the program itself, fine as they are)

- First Service Doubles, Akron OH and Verona WI: USTA Midwest program pages.
- Philadelphia Sunchasers, Rockland Community Tennis Association: their own `playtennis.usta.com` pages.
- Westside Challenger Tennis: its flyer on usta.com.

## Also noticed

- **GLASA Wheelchair Tennis** (staging `5b0a97d9`) is placed in Lake Forest, GLASA's office. Its tennis is played
  at the A.C. Nielsen Tennis Center, 530 Hibbard Rd, Winnetka (GLASA's event pages). Near-me searches use the
  listing's place, so Winnetka may be the better location. Its website, `glasa.org/sports-programs/`, is right.
- Some re-imported rows have different ids in staging and live (Rockland Community Tennis Association: staging
  `f7d29c10`, live `f814e0c6`), in case that matters when the fixes move to live.
