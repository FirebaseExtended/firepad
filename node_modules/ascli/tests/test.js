var cli = require("../ascli.js")("myapp");

cli.banner("staying straight".green.bold, "v1.0.0 through ascli");
cli.log("Hello world!".white.bold);
cli.log("...of ascli\n");
cli.log("Command line arguments".white.bold);
cli.log(cli.opt, cli.argv);
cli.banner("abcdefghijklmnopqrstuvwxyz 0123456789");
cli.ok("yep, that worked.");
cli.fail("nope, that didn't.");
