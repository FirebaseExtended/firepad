#!/bin/bash
# update-examples-version.sh - Updates all examples/ to the latest version.

set -o nounset
set -o errexit

# Go to repo root.
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "${script_dir}/..";

exit_on_error() {
  echo $1
  exit 1
}

git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."
git pull &> /dev/null

version=$(npm view . version)
version="v${version}"

echo "New Version: ${version}"

firepad_url="https://firepad.io/releases/${version}/firepad.min.js"
curl --output /dev/null --silent --head --fail ${firepad_url} || exit_on_error "Latest version not published to firepad.io? ${firepad_url} not found."

cd examples/
sed -i.bak """s#firepad.io/releases/[^/]*/#firepad.io/releases/${version}/#g""" *.html
rm *.bak

echo
echo "Examples updated. Pushing changes to GitHub."
git commit -am "[firepad-release] Bumped examples to v${version}"
git push origin master

echo
echo "Done."
