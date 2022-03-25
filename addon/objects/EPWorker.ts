export type MessageCallback = (msg: any) => Promise<any>;

export default class EPWorker {
  _messageCallback: MessageCallback;

  constructor() {
    this._messageCallback = async () => {};

    this._onMessage = this._onMessage.bind(this)
    addEventListener('message', this._onMessage)

    // Send a message that you are alive
    this._postMessage({registered: true})
  }

  async _onMessage(e: MessageEvent) {
    const message = e.data;

    const result = await this._messageCallback(message)
    this._postMessage(result)
  }

  _postMessage(message: any) {
    postMessage(message)
  }

  register(cb: MessageCallback) {
    this._messageCallback = cb;
  }
}
