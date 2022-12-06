import * as path from "path";
import * as vscode from "vscode";

const snappifyUrl = "https://snappify.com";

// maps the vscode languageIds to the snappify languageIds (if they are different)
const languageMap = new Map([
  ["dockerfile", "docker"],
  ["clojure", "abap"],
  ["javascriptreact", "jsx"],
  ["plaintext", "text"],
  ["scss", "sass"],
  ["shellscript", "shell"],
  ["typescriptreact", "tsx"],
  ["vue-html", "vue"],
]);

const open = async (uri: vscode.Uri) => {
  return await vscode.env.openExternal(uri);
};

const showEmptyCodeError = () => {
  return vscode.window.showErrorMessage(
    "Please select some code to open in snappify."
  );
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("snappify.new", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return showEmptyCodeError();
    }

    const { languageId, lineAt, getText, fileName } = editor.document;

    const { start, end, active } = editor.selection;
    const selection = (
      start.isEqual(end)
        ? lineAt(active.line).text
        : getText(new vscode.Range(start, end))
    ).trim();

    if (!selection || selection.length === 0) {
      return showEmptyCodeError();
    }

    const maxCharacterLength = 1500;
    if (selection.length > maxCharacterLength) {
      return vscode.window.showErrorMessage(
        `The selected code is longer than ${maxCharacterLength} characters.`
      );
    }

    const url = new URL(`${snappifyUrl}/new`);

    url.searchParams.set("p", "0");
    url.searchParams.set("f", encodeURIComponent(path.basename(fileName)));
    url.searchParams.set(
      "l",
      encodeURIComponent(languageMap.get(languageId) || languageId)
    );
    url.searchParams.set("c", encodeURIComponent(selection));

    open(vscode.Uri.parse(url.toString())).catch((err) => {
      vscode.window.showErrorMessage("Failed to open snappify", err);
      console.error("Failed to open snappify", err);
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
