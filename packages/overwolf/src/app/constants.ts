
//LOL Client Features
//@see https://overwolf.github.io/api/live-game-data/supported-launchers/league-of-legends
export const REQUIRED_FEATURES = [
  'game_flow',
];

// register gep events
export const REGISTER_RETRY_TIMEOUT = 10000;

//same name in the public/app/manifest.json  "windows"
export const WINDOW_NAMES = {
  BACKGROUND: "background",
  INGAME: "in_game",
  DESKTOP: "desktop",
};

//overwolf-hooks logs
export const OVERWOLF_HOOKS_OPTIONS = {
  displayLog: process.env.NODE_ENV === "production",
};
