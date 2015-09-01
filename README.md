# Firepad website.

To generate the docs, you'll need jekyll and some other gems, which you can install via bundler:

    gem install bundler
    bundle install

Then you can run: 

    jekyll serve --watch

And browse the site at http://localhost:4000/

To deploy to Firebase Hosting, run:

    ./deploy.sh

NOTE: Although this is a gh-pages branch, it's no longer compatible with 
Github Pages since the root of the jekyll files is src/ (although we override 
the source root in _config.yml, github does not respect it.)
