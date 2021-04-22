import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './vscode.css'
import { VSCodeAPI } from './VSCodeAPI'

// TODO: Type the incoming config data
let config: any = {}
let workspace = ''

const root = document.getElementById('root')

if (root) {
  workspace = root.getAttribute('data-workspace') || ''
}

window.addEventListener('message', e => {
  // Here's where you'd do stuff with the message
  // Maybe stick it into state management or something?
  const message = e.data
  console.log(message)
})

// Want to send messages back out to VS Code from the webview?
//
// VSCodeAPI.postMessage({
//   type: 'whatever',
//   data: {foo: true}
// })

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
