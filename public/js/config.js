// Images configuration
const images = {
  // System icons
  logo: "assets/logo.png",
  ico: "assets/ico.png",
  battery: "assets/battery.png",
  wifi: "assets/wifi.png",
  options: "assets/options.png",
  
  // Dock icons
  finder: "assets/finder-icon.png",
  launchpad: "assets/launchpad-icon.png",
  safari: "assets/safari-icon.png",
  mail: "assets/mail-icon.png",
  contacts: "assets/contacts-icon.png",
  calendar: "assets/calendar-icon.png",
  notes: "assets/notes-icon.png",
  reminders: "assets/reminders-icon.png",
  maps: "assets/maps-icon.png",
  messages: "assets/messages-icon.png",
  facetime: "assets/facetime-icon.png",
  appstore: "assets/appstore-icon.png",
  github: "assets/github-icon.png",
  systemPreferences: "assets/system-preferences-icon.png",
  trash: "assets/trash-icon.png",

  // Desktop apps
  harddisk: "assets/harddisk-app.png",
  
  // Finder assets
  finderRecents: "assets/finderAssets/finder-recents.png",
  finderDesktop: "assets/finderAssets/finder-desktop.png",
  finderDocuments: "assets/finderAssets/finder-documents.png",
  finderDownloads: "assets/finderAssets/finder-downloads.png",
  finderMac: "assets/finderAssets/finder-mac.png",

  // Launchpad assets
  brave: "assets/launchpadAssets/brave-icon.png",
  calculator: "assets/launchpadAssets/calculator-icon.png",
  chrome: "assets/launchpadAssets/chrome-icon.png",
  excel: "assets/launchpadAssets/excel-icon.png",
  firefox: "assets/launchpadAssets/firefox-icon.png",
  linkedin: "assets/launchpadAssets/linkedin-icon.png",
  opera: "assets/launchpadAssets/opera-icon.png",
  twitter: "assets/launchpadAssets/twitter-icon.png",
  word: "assets/launchpadAssets/word-icon.png",

  // Other assets
  introLogo: "assets/intro-logo.png",
  calendarFull: "assets/calendar.png",
  profile: "assets/me.png",
  office: "assets/office.png",
  loader: "assets/loader.gif",
  startup: "assets/startup.mp4",
  background: "assets/yosemite.jpg",
  notFound: "assets/404.gif"
};

// Make images and getImage globally available
window.getImage = function(name) {
  if (!images[name]) {
    console.warn('Image "' + name + '" not found in configuration');
    return '';
  }
  return images[name];
};

// Configuration settings for the application
export const config = {
  // Internet Computer canister ID
  canisterId: "74iy7-xqaaa-aaaaf-qagra-cai",
  
  // API endpoints
  api: {
    baseUrl: "https://74iy7-xqaaa-aaaaf-qagra-cai.ic0.app",
    auth: "/auth",
    trading: "/trading"
  },

  // App settings
  app: {
    name: "PeppleOS",
    version: "1.0.0",
    defaultLanguage: "en"
  },

  // UI settings
  ui: {
    theme: "light",
    animations: true,
    defaultWindowSize: {
      width: 800,
      height: 600
    }
  },

  // Trading settings
  trading: {
    defaultPair: "ICP/USD",
    refreshInterval: 5000, // 5 seconds
    chartTimeframe: "1h"
  },

  // Text content
  text: {
    intro: {
      title: "Welcome to PeppleOS",
      description: "Your Internet Computer Operating System",
      additionalInfo: [
        "PeppleOS is a decentralized operating system running on the Internet Computer.",
        "Start exploring by clicking on the icons in the dock below."
      ]
    },
    help: {
      title: "PeppleOS Help",
      content: [
        "Click on the icons in the dock to open applications.",
        "Use the menu bar at the top to access different features.",
        "Drag and drop icons to organize your desktop."
      ]
    },
    finder: {
      welcome: "Welcome to Finder, click on one of the categories on the left to get started."
    }
  },

  // Image paths
  images: {
    logo: "/assets/logo.png",
    battery: "/assets/battery.png",
    wifi: "/assets/wifi.png",
    finder: "/assets/finder-icon.png",
    launchpad: "/assets/launchpad-icon.png",
    safari: "/assets/safari-icon.png",
    contacts: "/assets/contacts-icon.png",
    calendar: "/assets/calendar-icon.png",
    notes: "/assets/notes-icon.png",
    reminders: "/assets/reminders-icon.png",
    facetime: "/assets/facetime-icon.png",
    systemPreferences: "/assets/system-preferences-icon.png",
    trash: "/assets/trash-icon.png",
    harddisk: "/assets/harddisk-app.png",
    introLogo: "/assets/intro-logo.png",
    calendarFull: "/assets/calendar.png",
    office: "/assets/me.png"
  }
};
