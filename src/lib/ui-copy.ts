import type { NewsLanguage } from "./language";
import type { CategorySlug } from "./types";

export interface VoteCopy {
  question: string;
  goodLabel: string;
  badLabel: string;
  goodAriaLabel: string;
  badAriaLabel: string;
}

export interface UiCopy {
  aria: {
    newsCategories: string;
    newsLanguage: string;
    feedLayout: string;
    themeSwitch: (label: string) => string;
    totalVotes: (count: number) => string;
    shareArticle: (title: string) => string;
    shareWhatsApp: string;
    sentimentBar: (goodPercent: number, badPercent: number) => string;
    loadMoreStories: string;
    closeArticle: string;
    articleReader: string;
  };
  hero: {
    editionBadge: string;
    tagline: string;
    storiesToday: (count: number) => string;
    priorEditionsNote: string;
  };
  footer: {
    tagline: string;
    schedule: string;
  };
  topStories: {
    eyebrow: string;
    title: string;
    votes: (count: number) => string;
    goodForCountry: (percent: number) => string;
  };
  reader: {
    loading: string;
    loadFailed: string;
    closeHint: string;
    cachedNote: string;
  };
  theme: { light: string; dark: string; system: string };
  view: { grid: string; list: string };
  section: string;
  storiesCount: (count: number) => string;
  votesCount: (count: number) => string;
  readerVotes: (count: number) => string;
  readAtSource: (sourceName: string) => string;
  relatedVideo: string;
  share: string;
  toast: { linkCopied: string; copyFailed: string };
}

const EN: UiCopy = {
  aria: {
    newsCategories: "News categories",
    newsLanguage: "News language",
    feedLayout: "Feed layout",
    themeSwitch: (label) => `Theme: ${label}. Activate to switch.`,
    totalVotes: (count) => `Total votes: ${count}`,
    shareArticle: (title) => `Share ${title}`,
    shareWhatsApp: "Share on WhatsApp",
    sentimentBar: (good, bad) =>
      `Sentiment bar: ${good}% good, ${bad}% bad`,
    loadMoreStories: "Load more stories",
    closeArticle: "Close article",
    articleReader: "Article reader",
  },
  hero: {
    editionBadge: "Today's edition · refreshed 9:00 AM IST",
    tagline:
      "Facts only — who, what, when, where. You judge what it means for India through your vote on every story.",
    storiesToday: (count) => `${count} stories today`,
    priorEditionsNote: "Prior editions are replaced each morning",
  },
  footer: {
    tagline:
      "Factual reporting only. Community votes reflect reader sentiment, not editorial endorsement.",
    schedule: "One edition per day · 9:00 AM IST",
  },
  topStories: {
    eyebrow: "Most rated today",
    title: "Top stories by reader votes",
    votes: (count) => `${count} votes`,
    goodForCountry: (percent) => `${percent}% rated good for the country`,
  },
  reader: {
    loading: "Loading full article…",
    loadFailed: "Could not load the full article. Read at the original source.",
    closeHint: "Tap outside or press Esc to return to the feed",
    cachedNote: "Cached on this device for faster reading",
  },
  theme: { light: "Light", dark: "Dark", system: "System" },
  view: { grid: "Grid", list: "List" },
  section: "Section",
  storiesCount: (count) => `${count} stories`,
  votesCount: (count) => `${count} ${count === 1 ? "vote" : "votes"}`,
  readerVotes: (count) =>
    `${count} reader ${count === 1 ? "vote" : "votes"}`,
  readAtSource: (source) => `Read at ${source}`,
  relatedVideo: "Related video",
  share: "Share",
  toast: { linkCopied: "Link copied", copyFailed: "Could not copy link" },
};

const HI: UiCopy = {
  aria: {
    newsCategories: "समाचार श्रेणियाँ",
    newsLanguage: "समाचार की भाषा",
    feedLayout: "फ़ीड लेआउट",
    themeSwitch: (label) => `थीम: ${label}। बदलने के लिए सक्रिय करें।`,
    totalVotes: (count) => `कुल वोट: ${count}`,
    shareArticle: (title) => `${title} साझा करें`,
    shareWhatsApp: "व्हाट्सऐप पर साझा करें",
    sentimentBar: (good, bad) =>
      `भावना पट्टी: ${good}% अच्छा, ${bad}% बुरा`,
    loadMoreStories: "और खबरें देखें",
    closeArticle: "लेख बंद करें",
    articleReader: "लेख पाठक",
  },
  hero: {
    editionBadge: "आज का संस्करण · सुबह 9:00 बजे IST पर नवीनीकरण",
    tagline:
      "केवल तथ्य — कौन, क्या, कब, कहाँ। हर खबर पर अपने वोट से आप अपनी राय दें।",
    storiesToday: (count) => `${count} खबरें आज`,
    priorEditionsNote: "पिछले संस्करण हर सुबह बदले जाते हैं",
  },
  footer: {
    tagline:
      "केवल तथ्यपूर्ण रिपोर्टिंग। पाठक वोट संपादकीय समर्थन नहीं, बल्कि पाठक भावना दर्शाते हैं।",
    schedule: "प्रतिदिन एक संस्करण · सुबह 9:00 बजे IST",
  },
  topStories: {
    eyebrow: "आज सबसे अधिक रेटिंग",
    title: "पाठकों के वोट पर शीर्ष खबरें",
    votes: (count) => `${count} वोट`,
    goodForCountry: (percent) => `${percent}% ने देश के लिए अच्छा माना`,
  },
  reader: {
    loading: "पूरा लेख लोड हो रहा है…",
    loadFailed:
      "पूरा लेख लोड नहीं हो सका। मूल स्रोत पर पढ़ें।",
    closeHint: "फ़ीड पर लौटने के लिए बाहर टैप करें या Esc दबाएँ",
    cachedNote: "तेज़ पढ़ने के लिए इस डिवाइस पर सहेजा गया",
  },
  theme: { light: "लाइट", dark: "डार्क", system: "सिस्टम" },
  view: { grid: "ग्रिड", list: "सूची" },
  section: "अनुभाग",
  storiesCount: (count) => `${count} खबरें`,
  votesCount: (count) => `${count} वोट`,
  readerVotes: (count) => `${count} पाठक वोट`,
  readAtSource: (source) => `${source} पर पढ़ें`,
  relatedVideo: "संबंधित वीडियो",
  share: "साझा करें",
  toast: { linkCopied: "लिंक कॉपी हो गया", copyFailed: "लिंक कॉपी नहीं हो सका" },
};

export function getUiCopy(language: NewsLanguage): UiCopy {
  return language === "hi" ? HI : EN;
}

export function getVoteCopy(
  category: CategorySlug,
  language: NewsLanguage,
): VoteCopy {
  if (language === "hi") {
    if (category === "sports") {
      return {
        question: "क्या आपको यह खबर पसंद है?",
        goodLabel: "पसंद",
        badLabel: "नापसंद",
        goodAriaLabel: "इस खबर को पसंद के रूप में वोट करें",
        badAriaLabel: "इस खबर को नापसंद के रूप में वोट करें",
      };
    }
    if (category === "science-tech") {
      return {
        question: "क्या यह आपके लिए रोचक है?",
        goodLabel: "रोचक",
        badLabel: "रोचक नहीं",
        goodAriaLabel: "रोचक के रूप में वोट करें",
        badAriaLabel: "रोचक नहीं के रूप में वोट करें",
      };
    }
    return {
      question: "क्या यह देश के लिए अच्छा है?",
      goodLabel: "अच्छा",
      badLabel: "बुरा",
      goodAriaLabel: "देश के लिए अच्छा वोट करें",
      badAriaLabel: "देश के लिए बुरा वोट करें",
    };
  }

  if (category === "sports") {
    return {
      question: "Do you like this story?",
      goodLabel: "Like",
      badLabel: "Don't like",
      goodAriaLabel: "Vote like this story",
      badAriaLabel: "Vote do not like this story",
    };
  }
  if (category === "science-tech") {
    return {
      question: "Is this interesting to you?",
      goodLabel: "Interesting",
      badLabel: "Not interested",
      goodAriaLabel: "Vote interesting",
      badAriaLabel: "Vote not interested",
    };
  }
  if (category === "markets") {
    return {
      question: "Is this useful for your financial decisions?",
      goodLabel: "Useful",
      badLabel: "Not useful",
      goodAriaLabel: "Vote useful for financial decisions",
      badAriaLabel: "Vote not useful for financial decisions",
    };
  }
  return {
    question: "Is this good for the country?",
    goodLabel: "Good",
    badLabel: "Bad",
    goodAriaLabel: "Vote good for the country",
    badAriaLabel: "Vote bad for the country",
  };
}
