const EVERYONE = "everyone";

function audienceIds(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function topicRows(body) {
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.topics)) return body.topics;
  return [];
}

export async function featureAvailable(db, featureId, email, fetcher = fetch, apiKey = "") {
  let feature;

  try {
    feature = await db
      .prepare("SELECT audience_json FROM feature_toggles WHERE id = ?")
      .bind(featureId)
      .first();
  } catch {
    return false;
  }

  const audiences = audienceIds(feature?.audience_json);
  if (audiences.includes(EVERYONE)) return true;
  if (!email || !apiKey || !audiences.length) return false;

  try {
    const response = await fetcher(
      `https://api.resend.com/contacts/${encodeURIComponent(String(email).toLowerCase())}/topics`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "Adaptive-Sports-Near-Me/1.0",
        },
      },
    );
    if (!response.ok) return false;
    const topics = topicRows(await response.json());
    return topics.some((topic) => {
      const id = String(topic?.id || "");
      const subscription = String(topic?.subscription || "opt_in");
      return audiences.includes(id) && subscription !== "opt_out";
    });
  } catch {
    return false;
  }
}

export { EVERYONE, audienceIds };
