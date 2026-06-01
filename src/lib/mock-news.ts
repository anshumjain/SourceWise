import { trimSummary } from "./news-utils";
import type { RawNewsItem } from "./types";

const POLITICS_TEMPLATES = [
  "The {body} announced {action} in {place} on {date}. Officials stated the measure affects {scope}.",
  "{leader} met with representatives in {place} regarding {topic}. A statement listed attendees and outcomes.",
  "Authorities in {state} reported {event} on {date}. Local officials provided figures and next steps.",
  "Parliament recorded {action} on {topic} on {date}. Records show voting numbers and session details.",
  "The {body} issued a notification about {topic} in {place}. The document cites dates and affected areas.",
];

const SPORTS_TEMPLATES = [
  "{team} played against {opponent} in {place} on {date}. The match score was {score}.",
  "{player} participated in {event} held in {place}. Organizers published timings and results.",
  "The {tournament} continued in {place} on {date}. Match officials released schedules and outcomes.",
  "{team} named its squad for {event}. The list includes player names and roles for the fixture.",
  "A sports body in {place} confirmed {event} on {date}. Venue details and participant count were noted.",
];

const SCIENCE_TEMPLATES = [
  "Researchers in {place} reported {finding} on {date}. The study describes methods and sample size.",
  "A {org} launched {product} in {place}. Specifications and availability dates were listed.",
  "Scientists at {org} published findings on {topic}. The paper outlines data sources and timelines.",
  "A technology firm announced {product} for users in {place}. Release dates and supported platforms were shared.",
  "An institute in {place} completed trials for {topic} on {date}. Results include measured outcomes.",
];

const PLACEHOLDERS: Record<string, string[]> = {
  body: ["Union government", "state cabinet", "election commission", "ministry"],
  action: ["a policy update", "a public hearing", "a regulatory order", "a briefing"],
  place: ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"],
  date: ["31 May 2026", "30 May 2026", "29 May 2026"],
  scope: ["several districts", "identified sectors", "listed departments"],
  leader: ["A senior minister", "A state chief minister", "A committee chair"],
  topic: ["infrastructure plans", "budget allocations", "public services", "transport routes"],
  state: ["Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat"],
  event: ["a district review", "a coordination meeting", "a filing deadline"],
  team: ["India", "Mumbai Indians", "Chennai Super Kings", "Bengaluru FC"],
  opponent: ["Australia", "England", "Pakistan", "South Africa"],
  score: ["245/6", "189 all out", "2-1", "3-0"],
  player: ["A national team captain", "A recorded batsman", "A listed sprinter"],
  tournament: ["domestic league", "international series", "national championship"],
  finding: ["a clinical observation", "a weather pattern study", "a materials test"],
  org: ["ISRO", "IIT Delhi", "a public research lab", "a telecom operator"],
  product: ["a satellite mission", "a mobile chipset", "a cloud service", "a health app"],
};

function fillTemplate(template: string, index: number): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const options = PLACEHOLDERS[key] ?? ["India"];
    return options[index % options.length];
  });
}

function buildMockItem(
  category: RawNewsItem["category"],
  index: number,
  templates: string[]
): RawNewsItem {
  const template = templates[index % templates.length];
  const summary = trimSummary(fillTemplate(template, index));
  const places = PLACEHOLDERS.place;
  const place = places[index % places.length];

  const headlines: Record<RawNewsItem["category"], string[]> = {
    politics: [
      `Government records update on public policy in ${place}`,
      `Officials release meeting details from ${place}`,
      `State authorities publish figures for ${place} region`,
      `Parliament session documents actions taken on ${place} matter`,
      `Notification issued covering procedures in ${place}`,
    ],
    sports: [
      `Match results published from ${place} fixture`,
      `Squad list released for upcoming ${place} event`,
      `Tournament schedule updated for ${place} venue`,
      `Player participation noted at ${place} competition`,
      `Sports body confirms event timings in ${place}`,
    ],
    "science-tech": [
      `Research team shares study data from ${place}`,
      `Technology rollout dates listed for ${place}`,
      `Institute publishes findings on ${place} project`,
      `Product specifications released for ${place} users`,
      `Trial outcomes documented at ${place} facility`,
    ],
  };

  const headlineList = headlines[category];
  const headline = headlineList[index % headlineList.length];
  const publishedAt = new Date(Date.now() - index * 3600000);

  return {
    category,
    headline,
    summary,
    sourceUrl: `https://example.com/${category}/${index + 1}`,
    sourceName: "Mock Source",
    publishedAt,
    imageUrl: null,
  };
}

export function generateMockNews(): RawNewsItem[] {
  const items: RawNewsItem[] = [];

  for (let i = 0; i < 50; i++) {
    items.push(buildMockItem("politics", i, POLITICS_TEMPLATES));
  }
  for (let i = 0; i < 20; i++) {
    items.push(buildMockItem("sports", i, SPORTS_TEMPLATES));
  }
  for (let i = 0; i < 20; i++) {
    items.push(buildMockItem("science-tech", i, SCIENCE_TEMPLATES));
  }

  return items;
}
