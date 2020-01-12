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

#git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."

echo "Running npm install, build, and test..."
#npm install
# Make sure there were no package-lock.json changes.
#git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."
#npm run build
#npm run test

last_release=$(git describe --tags --abbrev=0)
echo "Last Release: ${last_release}"
echo
echo "Commits Since Last Release:"
git log "${last_release}..HEAD" --oneline
echo
echo "Current CHANGELOG.md Contents:"
cat CHANGELOG.MD
echo
echo "Does CHANGELOG.md look correct?"
echo "    <enter> to continue, Ctrl-C to abort (then update and commit it)."
read

echo "Creating new version (update package.json and create tag)."
#npm version ${release_type}
new_release=$(git describe --tags --abbrev=0)

# See http://go/npm-publish
echo
echo "Logging into npm via wombat-dressing-room."
read -p "Press <enter> to open browser, then click 'Create 24 hour token'."
#npm login --registry https://wombat-dressing-room.appspot.com

echo "Publishing ${new_release} to npm..."
#npm publish --registry https://wombat-dressing-room.appspot.com

# Create a separate release notes file to be included in the github release.
release_notes_file=$(mktemp)
#echo "${new_release}" >> "${release_notes_file}"
#echo >> "${release_notes_file}"
#cat CHANGELOG.md >> "${release_notes_file}"
#echo ${release_notes_file}

echo "Clearing CHANGELOG.md..."
#echo > CHANGELOG.md
#git commit -m "[firepad-release] Cleared CHANGELOG.md after ${new_release} release." CHANGELOG.md

echo "Pushing changes to GitHub..."
#git push origin master --tags

echo "Creating GitHub release..."
#hub release create \
#    --file "${release_notes_file}" \
#    --attach dist/firepad.js \
#    --attach dist/firepad.min.js \
#    --attach dist/firepad.css \
#    --attach dist/firepad.eot \
#    "${new_release}"

echo "OKAY!"