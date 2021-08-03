import * as monaco from "monaco-editor";
import firebase from "firebase/app";
import "firebase/database";

import * as Firepad from "../src";

const getExampleRef = function (): firebase.database.Reference {
  let ref = firebase.database().ref();

  const hash = window.location.hash.replace(/#/g, "");
  if (hash) {
    ref = ref.child(hash);
  } else {
    ref = ref.push(); // generate unique location.
    window.location.replace(window.location + "#" + ref.key); // add it as a hash to the URL.
  }

  console.log("Firebase data: ", ref.toString());
  return ref;
};

const init = function (): void {
  // Initialize Firebase.
  firebase.initializeApp(process.env.FIREBASE_CONFIG);

  // Get Firebase Database reference.
  const firepadRef = getExampleRef();

  // Create Monaco and firepad.
  const editor = monaco.editor.create(document.getElementById("firepad"), {
    language: "typescript",
    fontSize: 18,
    theme: "vs-dark",
    // @ts-ignore
    trimAutoWhitespace: false,
  });

  const firepad = Firepad.fromMonaco(firepadRef, editor, {
    userName: `Anonymous ${Math.floor(Math.random() * 100)}`,
    defaultText: `// typescript Editing with Firepad!
function go() {
  var message = "Hello, world.";
  console.log(message);
}
`,
  });

  window["firepad"] = firepad;
  window["editor"] = editor;

  window.addEventListener("resize", function () {
    editor.layout();
  });
};

// Initialize the editor in non-blocking way
setTimeout(init);

// Hot Module Replacement Logic
declare var module: NodeModule & {
  hot: { accept(path: string, callback: Function): void };
};

if (module.hot) {
  const onHotReload = function (): void {
    console.clear();
    console.log("Changes detected, recreating Firepad!");

    const Firepad = require("../src/index.ts");

    // Get Editor and Firepad instance
    const editor: monaco.editor.IStandaloneCodeEditor = window["editor"];
    const firepad: Firepad.Firepad = window["firepad"];

    // Get Constructor Options
    const firepadRef: firebase.database.Reference = getExampleRef();
    const userId: string | number = firepad.getConfiguration("userId");
    const userName: string = firepad.getConfiguration("userName");

    // Dispose previous connection
    firepad.dispose();

    // Create new connection
    window["firepad"] = Firepad.fromMonaco(firepadRef, editor, {
      userId,
      userName,
    });
  };

  module.hot.accept("../src/index.ts", onHotReload);
}
