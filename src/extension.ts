import * as vscode from 'vscode'
import MyWebview from './MyWebview'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('snowpackWebview.start', () => {
      MyWebview.createOrShow(context.extensionUri)
    })
  )
}
