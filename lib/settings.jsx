// Configure()
const fs = require('fs-extra');
const stripJsonComments = require('strip-json-comments');
// checkForUpdate()
const GitHubApi = require("github");
const config = require('../package.json');

module.exports = {
  // configure() needs to be called at the beginning of main.jsx
  // Loads user settings or reverts to defaults
  //
  configure: () => {
    const defaultSettings = `${__dirname}/../unsubscribe-settings.defaults.json`;
    const userSettings = `${__dirname}/../unsubscribe-settings.json`;
    let settingsFile;
    try {
      // Use user defined settings file, else the defaults
      settingsFile = fs.readFileSync(userSettings, 'utf8');
    } catch (e) {
      console.log(`n1-unsubscribe: Copying default settings to ${userSettings}.`);
      fs.copySync(defaultSettings, userSettings);
      settingsFile = fs.readFileSync(userSettings, 'utf8');
    }
    const settingsJSON = stripJsonComments(settingsFile);
    const settings = JSON.parse(settingsJSON);

    // Configure global variables
    process.env.N1_UNSUBSCRIBE_USE_BROWSER = settings.use_browser === true ||
      settings.use_browser === 'true';
    process.env.N1_UNSUBSCRIBE_THREAD_HANDLING = settings.handle_threads;
    process.env.N1_UNSUBSCRIBE_CONFIRM_EMAIL = settings.confirm_for_email === true ||
      settings.confirm_for_email === 'true';
    process.env.N1_UNSUBSCRIBE_CONFIRM_BROWSER = settings.confirm_for_browser === true ||
      settings.confirm_for_browser === 'true';

    // Print settings file to console
    const browserText = (process.env.n1UnsubscribeUseBrowser === 'true' ? '' : '(Popup)');
    const useBrowser = process.env.N1_UNSUBSCRIBE_USE_BROWSER;
    console.log(
      `n1-unsubscribe settings:
      - Use preferred browser for unsubscribing: ${useBrowser} ${browserText}
      - Archive or trash after unsubscribing: ${process.env.N1_UNSUBSCRIBE_THREAD_HANDLING}
      - Confirm before email unsubscribing: ${process.env.N1_UNSUBSCRIBE_CONFIRM_EMAIL}
      - Confirm before browser unsubscribing: ${process.env.N1_UNSUBSCRIBE_CONFIRM_BROWSER}`
    );
  },
  // checkForUpdate() sends a request to the Github API to see if a new release is available
  // The function also updates global variables with package settings
  //
  checkForUpdate: (pluginUpdater) => {
    const github = new GitHubApi({
      version: '3.0.0',
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      timeout: 5000,
      headers: {
        'user-agent': 'N1-Updater',
      },
    });
    github.releases.listReleases({
      owner: 'colinking',
      repo: 'n1-unsubscribe',
      per_page: 1,
    }, (err, res) => {
      if (err) console.log(err);
      const curVer = config.version;
      const avaVer = res[0].name;
      // res[0].name -> "1.2.3"
      // res[0].tag_name -> "1.2.3"
      if (avaVer !== curVer && res[0].draft === false) {
        // Update globals:
        process.env.N1_UNSUBSCRIBE_CURRENT_VER = curVer;
        process.env.N1_UNSUBSCRIBE_AVAILABLE_VER = avaVer;
        const releaseURL = res[0].html_url;
        process.env.N1_UNSUBSCRIBE_AVAILABLE_URL = releaseURL;
        console.log(`New release available at ${releaseURL}!`);
        const downloadURL = res[0].assets[0].browser_download_url;
        process.env.N1_UNSUBSCRIBE_DOWNLOAD_URL = downloadURL;
        // Fire notification event
        return pluginUpdater.activate('NEW_RELEASE');
      }
      return false;
    });
  },
}
