export type MessageCallback = (msg: MessageEvent) => any;

export default class EPWorker {
  _messageCallback: MessageCallback;

  constructor() {
    this._messageCallback = () => {};

    this._onMessage = this._onMessage.bind(this)
    addEventListener('message', this._onMessage)

    // Send a message that you are alive
    this._postMessage({registered: true})
  }

  _onMessage(e: MessageEvent) {
    // const message = e;

    const result = this._messageCallback(e)
    this._postMessage(result)
  }

  _postMessage(message: any) {
    postMessage(message)
  }

  register(cb: MessageCallback) {
    this._messageCallback = cb;
  }
}
