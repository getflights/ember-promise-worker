addEventListener('message', (event) => {
  event.ports[0].postMessage(event.data)
})
