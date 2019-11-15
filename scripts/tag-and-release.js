const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const https = require('https');

const package = require('../package.json');

const github = 'api.github.com';
const githubToken = process.env.GITHUB_TOKEN;
const repoSlug = process.env.TRAVIS_REPO_SLUG;
const githubAssets = 'uploads.github.com';

function pushRelease({
  hostname,
  path,
  data,
  contentType,
}) {
  const opts = {
    method: 'POST',
    hostname,
    path,
    headers: {
      Authorization: 'token ' + githubToken,
      'User-Agent': 'brijeshb42/repo',
    },
  };

  if (contentType) {
    baseOpts.headers['Content-Type'] = contentType;
  }

  return new Promise(function(resolve, reject) {
    const req = https.request(opts, function(res) {
      const data = [];

      res.on('data', (d) => {
        data.push(d);
      });

      res.on('end', () => {
        try {
          const resp = JSON.parse(Buffer.concat(data).toString());
          if (res.statusCode >= 400) {
            reject(resp);
          } else {
            resolve(resp);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

pushRelease({
  hostname: github,
  path: `/repos/${repoSlug}/releases`,
  data: JSON.stinrgify({
    tag_name: package.version,
  }),
  contentType: 'application/json',
})
  .then(data => {
    if (data && data.id) {
      console.log(`Release ${data.id} tagged successfully.`);

      const tarball = execSync('npm pack').toString().trim();
      pushRelease({
        hostname: githubAssets,
        path: `/repos/${repoSlug}/releases/${data.id}/assets?name=${tarball}`,
        data: fs.readFileSync(path.join(process.cwd(), tarball)),
        contentType: 'application/octet-stream',
      }).then(data => {
        console.log('Pushed assets to github.');
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }).catch(err => {
    console.log('Release rejected');
    console.error(err);
    process.exit(1);
  });
