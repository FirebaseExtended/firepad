function replace() {
  sed -e "s#http://www.firepad.io/#../#" -i "" $1
}

replace index.html
replace demo.css
