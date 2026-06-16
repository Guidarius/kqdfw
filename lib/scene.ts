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

// ============================================================
// VISUALS — photos that make the site feel like a real, fun
// scene. Drop image files into /public/images and point to them
// here. Leave `src` empty ("") to show a styled placeholder
// instead of a broken image — see /public/images/README.md.
// ============================================================

export type Photo = {
  src: string; // e.g. "/images/gallery/league-night.jpg" — "" shows a placeholder
  alt: string; // describe the photo (also used as the placeholder caption)
  credit?: string; // optional photographer / source credit
};

// The KQDFW logo. Leave `src` empty to show the text wordmark
// "KQ DFW" instead. Drop a transparent PNG/SVG in /public/images/logo.
export const logo: { src: string; alt: string } = {
  src: "", // EDIT: "/images/logo/kqdfw.png"
  alt: "KQDFW logo",
};

// Big banner image at the top of the home page. A wide, lively
// shot of a packed cabinet or league night works best.
export const hero: {
  image: Photo;
  tagline: string;
} = {
  image: {
    src: "", // EDIT: "/images/hero/your-photo.jpg" (wide ~1920×1080)
    alt: "Killer Queen DFW night — a crowd around the cabinet",
  },
  tagline: "10-player arcade Killer Queen across the metroplex.",
};

// Photo wall that shows off the community. Square-ish shots of
// people playing, crowds, teams, trophies — anything with energy.
// Add as many as you like; the grid adapts. Empty `src` = placeholder.
export const gallery: Photo[] = [
  { src: "", alt: "Players mid-match at the cabinet" },
  { src: "", alt: "The crowd watching a close game" },
  { src: "", alt: "Blue team celebrating a win" },
  { src: "", alt: "League night at Free Play" },
  { src: "", alt: "New player's first game" },
  { src: "", alt: "Post-game hangout" },
];

export const venues = [
  {
    name: "Free Play Richardson",
    area: "Richardson",
    maps: "https://www.google.com/maps/search/Free+Play+Richardson+TX",
  },
  {
    name: "Tokyo Station (Arlington)",
    area: "Arlington",
    maps: "https://www.google.com/maps/search/Tokyo+Station+Arlington+TX",
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
