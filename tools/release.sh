#!/bin/bash
# release.sh - Firepad release script.

set -o nounset
set -o errexit

# Go to repo root.
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "${script_dir}/..";

print_usage() {
  echo "$0 <version>"
  echo
  echo "Arguments:"
  echo "  version: 'patch', 'minor', or 'major'."
  exit 1
}

exit_on_error() {
  echo $1
  exit 1
}

if [[ $# -gt 0 ]]; then
  release_type="$1"
else
  print_usage
fi
if [[ ! ($release_type == "patch" || $release_type == "minor" || $release_type == "major") ]]; then
  print_usage
fi

which hub &> /dev/null || exit_on_error "Missing hub command. https://github.com/github/hub#installation"
which jekyll &> /dev/null || exit_on_error "Missing jekyll, needed fire firepad.io deploy. See https://github.com/FirebaseExtended/firepad/blob/gh-pages/README.md"

branch_name="$(git symbolic-ref HEAD 2>/dev/null)" ||
branch_name="(unnamed branch)"     # detached HEAD
branch_name=${branch_name##refs/heads/}
if [[ ! ($branch_name == "master") ]]; then
  exit_on_error "Releases must be run on master branch."
fi

git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."

echo
echo "Running npm install, build, and test..."
npm install
# Make sure there were no package-lock.json changes.
git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."
npm run build
npm run test

echo "Tests passed."
echo

last_release=$(git describe --tags --abbrev=0)
echo "Last Release: ${last_release}"
echo
echo "Commits Since Last Release:"
git log "${last_release}..HEAD" --oneline

echo
echo "Current CHANGELOG.md Contents:"
cat CHANGELOG.md
echo
echo "Does CHANGELOG.md look correct?"
echo "    <enter> to continue, Ctrl-C to abort (then update and commit it)."
read


echo
echo "Logging into npm via wombat-dressing-room (see http://go/npm-publish)."
echo "   Press <enter> to open browser, then click 'Create 24 hour token'."
echo "   If you can't open a browser, try logging in from a different machine:"
echo "     npm login --registry https://wombat-dressing-room.appspot.com"
echo "   And then copy/paste the resulting ~/.npmrc contents here:"
echo "   (this will overwrite your current ~/.npmrc)"
read npmrc

if [[ ! $npmrc == "" ]]; then
  echo $npmrc > ~/.npmrc
else
  npm login --registry https://wombat-dressing-room.appspot.com
fi

echo
echo "Bumping version (update package.json and create tag)."
npm version ${release_type}
new_release=$(git describe --tags --abbrev=0)
echo "New Version: ${new_release}"

echo
echo "Publishing ${new_release} to npm."
npm publish --registry https://wombat-dressing-room.appspot.com

# Create a separate release notes file to be included in the github release.
release_notes_file=$(mktemp)
echo "${new_release}" >> "${release_notes_file}"
echo >> "${release_notes_file}"
cat CHANGELOG.md >> "${release_notes_file}"
echo ${release_notes_file}

echo
echo "Clearing CHANGELOG.md."
echo > CHANGELOG.md
git commit -m "[firepad-release] Cleared CHANGELOG.md after ${new_release} release." CHANGELOG.md

echo
echo "Pushing changes to GitHub."
git push origin master --tags

echo
echo "Creating GitHub release."
hub release create \
    -F "${release_notes_file}" \
    -a dist/firepad.js \
    -a dist/firepad.min.js \
    -a dist/firepad.css \
    -a dist/firepad.eot \
    "${new_release}"

echo
echo "Done. ${new_release} pushed to npm and GitHub. To publish assets to firepad.io run:"
echo "    git checkout gh-pages && git pull && ./update-firepad.sh ${new_release}"
