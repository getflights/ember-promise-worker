// Alternative: self.onmessage
addEventListener('message', (event) => {
  // throw new Error('yeeee')
  postMessage(event.data);
})
