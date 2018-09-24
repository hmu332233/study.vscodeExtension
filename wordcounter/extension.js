// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
const vscode = require("vscode");
// import vscode from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "wordcounter" is now active!');

  // create a new word counter
  let wordCounter = new WordCounter();
  let controller = new WordCounterController(wordCounter);

  // Add to a list of disposables which are disposed when this extension is deactivated.
  context.subscriptions.push(controller);
  context.subscriptions.push(wordCounter);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;

class WordCounter {

  constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  }

  updateWordCount() {
    // Get the current text editor
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._statusBarItem.hide();
      return;
    }

    let doc = editor.document;

    // Only update status if a Markdown file
    if (doc.languageId === "markdown") {
      let wordCount = this._getWordCount(doc);

      // Update the status bar
      this._statusBarItem.text = wordCount !== 1 ? `${wordCount} Words` : '1 Word';
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  _getWordCount(doc) {

    let docContent = doc.getText();

    // Parse out unwanted whitespace so the split is accurate
    docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
    docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    let wordCount = 0;
    if (docContent !== "") {
      wordCount = docContent.split(" ").length;
    }

    return wordCount;
  }

  dispose() {
    this._statusBarItem.dispose();
  }
}

class WordCounterController {

  constructor(wordCounter) {
    this._wordCounter = wordCounter;

    // subscribe to selection change and editor activation events
    let subscriptions = [];
    vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

    // update the counter for the current file
    this._wordCounter.updateWordCount();

    // create a combined disposable from both event subscriptions
    this._disposable = vscode.Disposable.from(...subscriptions);
  }


  dispose() {
    this._disposable.dispose();
  }

  _onEvent() {
    this._wordCounter.updateWordCount();
  }
}