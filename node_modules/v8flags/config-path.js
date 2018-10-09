const os = require('os');
const path = require('path');
const userHome = require('homedir-polyfill')();

const env = process.env;
const name = 'js-v8flags';

function macos () {
  const library = path.join(userHome, 'Library');
  return path.join(library, 'Caches', name);
}

function windows () {
  const appData = env.LOCALAPPDATA || path.join(userHome, 'AppData', 'Local');
  return path.join(appData, name);
}

// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
function linux () {
  const username = path.basename(userHome);
  return path.join(env.XDG_CACHE_HOME || path.join(userHome, '.cache'), name);
}

module.exports = function (platform) {
  if (!userHome) {
    return os.tmpdir();
  }

  if (platform === 'darwin') {
    return macos();
  }

  if (platform === 'win32') {
    return windows();
  }

  return linux();
};
