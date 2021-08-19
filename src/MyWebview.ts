import * as vscode from 'vscode'
import { getNonce } from './lib'

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
  }
}

export default class MyWebview {
  public static currentPanel: MyWebview | undefined

  public static readonly viewType = 'snowpackWebview'

  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    // If we already have a panel, show it.
    if (MyWebview.currentPanel) {
      MyWebview.currentPanel._panel.reveal(column)
      return
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      MyWebview.viewType,
      'Snowpack Powered',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri)
    )

    MyWebview.currentPanel = new MyWebview(panel, extensionUri)
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    MyWebview.currentPanel = new MyWebview(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri
    this._panel.webview.options = {
      enableScripts: true,
    }

    // Set the webview's initial html content
    this._update()

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update()
        }
      },
      null,
      this._disposables
    )

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text)
            return
        }
      },
      null,
      this._disposables
    )
  }

  public dispose() {
    MyWebview.currentPanel = undefined

    // Clean up our resources
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private _update() {
    const webview = this._panel.webview
    this._panel.title = 'Snowpack Powered Webview'
    this._panel.webview.html = this._getHtmlForWebview(webview)
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Generate the local paths to the built scripts
    // We've set up snowpack to build into the out/ directory
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out/webviews/VSWebview.es.js')
    )

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out/webviews/style.css')
    )

    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'node_modules',
        'vscode-codicons',
        'dist',
        'codicon.css'
      )
    )
    const codiconsFontUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'node_modules',
        'vscode-codicons',
        'dist',
        'codicon.ttf'
      )
    )

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce()

    // Return the HTML with all the relevant content embedded
    // Also sets a Content-Security-Policy that permits all the sources
    // we specified. Note that img-src allows `self` and `data:`,
    // which is at least a little scary, but otherwise we can't stick
    // SVGs in CSS as background images via data URLs, which is hella useful.
    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} 'self' data:; style-src ${webview.cspSource} ${codiconsUri}; script-src 'nonce-${nonce}'; font-src ${codiconsFontUri};">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

        
				<link href="${styleVSCodeUri}" rel="stylesheet" />
        <link href="${codiconsUri}" rel="stylesheet" />
        <script nonce="${nonce}">
          window.acquireVsCodeApi = acquireVsCodeApi;
        </script>

				<title>Cat Scratch</title>
			</head>
			<body>
				<div id="root"></div>			
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`
  }
}
