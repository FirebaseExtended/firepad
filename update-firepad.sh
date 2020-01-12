#!/bin/bash
# update-firepad.sh
# Downloads the specified firepad version from npm, puts it in the releases/
# directory, and updates website references to point at it.

set -o nounset
set -o errexit

# Go to repo root.
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "${script_dir}";

print_usage() {
  echo "$0 <firepad version>"
  echo
  echo "Arguments:"
  echo "  firepad version: Version of firepad (e.g. 1.5.4)"
  exit 1
}

exit_on_error() {
  echo $1
  exit 1
}

if [[ $# -gt 0 ]]; then
  version="$1"
else
  print_usage
fi

tarball=$(npm view firepad@${version} dist.tarball)
if [[ $tarball == "" ]]; then
  exit_on_error "Error: firepad@${version} doesn't exist on npm."
fi

git diff-index --quiet HEAD || exit_on_error "Modified files present; please commit or revert them."

echo
echo "Downloading firepad@${version} from npm."
scratch_dir=$(mktemp -d)
pushd ${scratch_dir}
curl ${tarball} | tar xvz
popd

echo
echo "Copying files to src/releases/${version}/"
mkdir -p src/releases/${version}
cp "${scratch_dir}"/package/dist/* "src/releases/${version}/"
git add "src/releases/${version}/"

echo
echo "Updating version in _config.yml."
sed -i.bak """s/firepad_version:.*/firepad_version: ${version}/""" _config.yml
rm _config.yml.bak
git add _config.yml

echo
echo "Committing changes to git."
git commit -m "[firepad-release] Check in firepad ${version} and update docs / examples."

echo
echo "Done. To publish the changes run:"
echo "    git push origin gh-pages && ./deploy.sh"
