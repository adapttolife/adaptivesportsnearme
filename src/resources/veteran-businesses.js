// Veteran-owned business directories, from Karen Atkinson's 2026-10-08 email
// ("Page to link state directories"). Her words are the page copy; the links
// are hers, checked 2026-10-13:
//   - every URL below answered in a real browser (veteranownedbusiness.com
//     blocks scripted requests with a bot check, so curl alone reads 403);
//   - all 50 veteranownedbusiness.com/<state> pages loaded with that state's name;
//   - Florida's directory link now lands on MyFloridaMarketPlace, where the
//     state keeps its certified veteran business list.
// A state with no official link says "State directory not yet verified", in
// Karen's words, until a person on the team finds and checks one.

export const VETERAN_BUSINESS_COPY = {
  title: "Support Veteran-Owned Businesses",
  kicker: "Their service doesn't end when the uniform comes off.",
  intro: [
    "Veterans continue to serve their communities by creating businesses, providing jobs, and supporting local economies.",
    "Want to show your support? Find veteran-owned businesses in your state using the directories below.",
  ],
  stateLead: "Choose your state. Shop veteran-owned. Support those who served.",
  scope: "Directory listings may include veteran-owned, service-disabled veteran-owned, and military-family-owned businesses. Certification and verification requirements vary by directory.",
  disclaimer: "Adaptive Sports Near Me provides these links as a public resource. Inclusion does not constitute an endorsement or independent verification of a business.",
  notVerified: "State directory not yet verified",
};

// Karen's three nationwide directories. The one-line notes say what each is.
export const NATIONWIDE = [
  {
    name: "SBA Veteran Small Business Certification",
    url: "https://veterans.certify.sba.gov/",
    note: "Run by the U.S. Small Business Administration. Search firms certified as veteran-owned or service-disabled veteran-owned.",
  },
  {
    name: "VeteranOwnedBusiness.com",
    url: "https://www.veteranownedbusiness.com/advanced_search.php",
    note: "A national directory you can search by business, city, state or ZIP code.",
  },
  {
    name: "American Veteran Owned Business Association",
    url: "https://avosba.org/avoba-membership/veteran-owned-businesses-by-state/",
    note: "Veteran-owned businesses listed state by state.",
  },
];

// Official state directories Karen named. Every other state is "not yet verified".
const OFFICIAL = {
  CA: { name: "California certified small and diverse businesses", url: "https://www.dgs.ca.gov/PD/Services/Page-Content/Procurement-Division-Services-List-Folder/Search-For-State-Certified-Small-And-Diverse-Businesses" },
  FL: { name: "Florida certified business directories", url: "https://osd.dms.myflorida.com/directories" },
  IL: { name: "Illinois Supplier Diversity Management Portal", url: "https://cei.illinois.gov/supplier-diversity-management-system.html" },
  NY: { name: "New York service-disabled veteran-owned business search", url: "https://sdves.ogs.ny.gov/business-search" },
  WI: { name: "Wisconsin veteran-owned business directory", url: "https://apps.dva.wisconsin.gov/VeteranOwnedBusiness" },
};

const NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// One row per state, alphabetical: the official directory when we have one,
// and the state's page on VeteranOwnedBusiness.com either way.
export const STATES = Object.entries(NAMES).map(([code, name]) => ({
  code,
  name,
  official: OFFICIAL[code] || null,
  national: {
    name: `Veteran-owned businesses in ${name}`,
    url: `https://www.veteranownedbusiness.com/${code.toLowerCase()}`,
  },
}));
