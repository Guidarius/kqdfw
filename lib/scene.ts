// ============================================================
// SCENE DATA — this is the one file you edit to keep the site
// current. Everything here renders on the public pages.
// ============================================================

export const links = {
  instagram: "https://www.instagram.com/kqdfw/",
  facebook: "https://www.facebook.com/kqdfw/",
  twitch: "https://www.twitch.tv/kq_dfw",
  hivemind: "https://kqhivemind.com/",
};

// EDIT: real contact info. A second (ideally woman) co-contact
// here is worth a lot — see /conduct and /first-night.
export const contacts = [
  {
    name: "Bob",
    role: "Scene contact",
    note: "Happy to answer anything before you come out — message the Instagram or Facebook page and ask for Bob.",
  },
];

export type ScheduleEntry = {
  day: string;
  label: string;
  venue: string;
  time: string;
  note?: string;
};

// EDIT WEEKLY (or whenever the rotation changes).
// Keeping this current is the single most important job of the site.
export const schedule: ScheduleEntry[] = [
  {
    day: "Weeknights",
    label: "Pickup games",
    venue: "Rotating — see this week's spot below",
    time: "Evenings, ~7pm til late",
    note: "We rotate between Free Play locations. The week's spot is decided by group poll — follow the Instagram or just message us and we'll tell you where everyone's going.",
  },
  {
    day: "Sunday",
    label: "League day",
    venue: "Free Play (league venue)", // EDIT: which location
    time: "Afternoon", // EDIT: real time
    note: "Team league play — 6 teams of 5. Spectators always welcome, and league days are a great low-pressure way to see the game played before you try it.",
  },
];

// EDIT: set this each week after the poll closes. Shown big on the
// schedule page. Leave empty string to hide the callout.
export const thisWeek = {
  headline: "", // e.g. "This week: Free Play Richardson, Thursday 7pm"
  detail: "",
};

export const venues = [
  {
    name: "Free Play Richardson",
    area: "Richardson",
    maps: "https://www.google.com/maps/search/Free+Play+Richardson+TX",
  },
  {
    name: "Free Play Arlington",
    area: "Arlington",
    maps: "https://www.google.com/maps/search/Free+Play+Arlington+TX",
  },
  {
    name: "Free Play Denton",
    area: "Denton",
    maps: "https://www.google.com/maps/search/Free+Play+Denton+TX",
  },
  {
    name: "Free Play Fort Worth",
    area: "Fort Worth",
    maps: "https://www.google.com/maps/search/Free+Play+Fort+Worth+TX",
  },
  {
    name: "Free Play Dallas",
    area: "Dallas",
    maps: "https://www.google.com/maps/search/Free+Play+Dallas+TX",
  },
  {
    name: "Arcade 92",
    area: "North Richland Hills",
    maps: "https://www.google.com/maps/search/Arcade+92+North+Richland+Hills+TX",
  },
  // EDIT: confirm cab status before listing publicly
  // {
  //   name: "Cidercade Bishop Arts",
  //   area: "Bishop Arts, Dallas",
  //   maps: "https://www.google.com/maps/search/Cidercade+Bishop+Arts+Dallas",
  // },
];
