Release Steps
=============

1. Review changelog
-------------------

I always use the top changelog link on [coffeelint.org][changelog] and change it
to point to `compare/vx.x.x...master`. Look through the pull request to figure
out whether this is a minor or patch release.

2. Tag
------

CoffeeLint follows [semver](http://semver.org/). When a new rule is added even
if it's off by default, it's at least a minor release. There are some things
marked deprecated. If we ever have a need for a 2.0 I'll remove those at that
time.

    npm version <major|minor|patch>

3. Write changelog
------------------

    git checkout gh-pages

The changelog is in `index-bottom.html`. Update it based on the PRs found in
step 1. I don't always mention every PR. Many internal changes like updates to
Travis don't matter to users of CoffeeLint, so I leave them out.

This next step is going to end up checkout out master, so I'll usually commit
the changelog updates and then I'll run `git commit --amend` after the next step.

4. Update `gh-page`'s coffeelint
--------------------------------

    rake update

I've never rewritten how this gets generated. Because it needs to pull a
compiled version of CoffeeLint from master, `rake update` gives you a set of
commands to copy and paste.

    # It doesn't matter if you ammend or add a new commit, this is just what I do.
    git commit --amend

5. Release all the things!
--------------------------

    git checkout master
    git push origin master
    git push origin gh-pages
    git push origin <tag>

I think it's important that people be able to install CoffeeLint directly from
git. People also got upset when the NPM version required installing browserify
and coffeeify when they were never actually used. For this reason I have a
`prepublish` script that will yank those and the `install` script out of
`package.json`. I had this fail to run for me once, so now I run it manually
just to make sure it's fine before I publish.

    npm run prepublish
    git diff
    npm publish
    git checkout package.json

[changelog]: http://www.coffeelint.org/#changelog
[review]: https://github.com/clutchski/coffeelint/compare/v1.8.1...master
