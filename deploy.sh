exit_on_error() {
  echo $1
  exit 1
}

which jekyll &> /dev/null || exit_on_error "Missing jekyll. See README.md"

jekyll build && firebase -P firebase-firepad deploy
