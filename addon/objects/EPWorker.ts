export type MessageCallback = (msg: any) => Promise<any>;

export default class EPWorker {
  _messageCallback: MessageCallback;

  constructor() {
    this._messageCallback = async () => {};

    this._onMessage = this._onMessage.bind(this)
    addEventListener('message', this._onMessage)

    // Send a message that you are alive
    postMessage({registered: true})
  }

  async _onMessage(e: MessageEvent) {
    const port = e.ports[0];
    const message = e.data;

    const result = await this._messageCallback(message).catch((e) => {
      port.postMessage({error: e})
    })

    port.postMessage(result)
  }

  register(cb: MessageCallback) {
    this._messageCallback = cb;
  }
}
