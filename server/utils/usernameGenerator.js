// utils/usernameGenerator.js
const adjectives = [
  "Happy",
  "Clever",
  "Brave",
  "Mighty",
  "Swift",
  "Calm",
  "Wise",
  "Gentle",
  "Bold",
  "Bright",
  "Cosmic",
  "Dazzling",
  "Epic",
  "Fancy",
  "Glorious",
];

const nouns = [
  "Panda",
  "Tiger",
  "Eagle",
  "Dolphin",
  "Phoenix",
  "Dragon",
  "Wizard",
  "Ninja",
  "Voyager",
  "Explorer",
  "Pioneer",
  "Ranger",
  "Knight",
  "Warrior",
  "Artist",
];

const generateUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}${noun}${number}`;
};

export default generateUsername;
