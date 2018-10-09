Creating a 3rd party rule
=========================

If your rule is overly specific or too restrictive it may not be accepted into
the CoffeeLint repo. This doesn't mean you can't have your rule.

Setup your repo
---------------

My personal preference is to not commit compiled Javascript files to a
CoffeeScript repo. 

1. `npm init`
2. `npm install --save coffee-script` When it asks about `main` leave it as `index.js`
3. Create an `index.js` it only needs two lines

        require('coffee-script');
        module.exports = require('./your_rule_name.coffee');

4. `sudo npm link`: Once you run this CoffeeLint will be able to `require` your module
5. Build your rule, make sure the file name matches `index.js`'s `require`

[link]: https://npmjs.org/doc/cli/npm-link.html

Loading your rule
-----------------

It's probably best once you get this worked out, to commit a coffeelint.json to
your repo with your rule enabled. Here is an example:


    {
        "your_rule_name": {
            "module": "your-rule-name"
        }
    }


* `your_rule_name`: This MUST match the name inside your rule. A few of of the
  built in rules are no_plus_plus, no_tabs, and cyclomatic_complexity
* `your-rule-name`: npm's convention is to use dashes. CoffeeLint is going to
  run `require('your-rule-name')` to find this rule.

Publishing your rule
--------------------

Once you're ready you can publish it as a normal npm package. Remember to
mention in your readme that they will need to `npm install -g your-rule-name`.
If it's not global CoffeeLint won't see it.

By convention rule authors add the keyword `coffeelintrule` to their npm 
`package.json` so custom rules can be found easily. Click
[here](https://npmjs.org/search?q=coffeelintrule) to list all currently available
custom rules on npm.

Verify Installation
-------------------

This will verify your development install when you used `sudo npm link` or when
users run `npm install -g your-rule-name`

Verify your installation using:

    node -p "require('your-rule-name');"

You should get output similar to

    [Function: YourRuleName]
