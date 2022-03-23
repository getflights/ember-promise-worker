import EPWorker from '../../app/objects/EPWorker'

const worker = new EPWorker()

worker.register((message) => {
  return message;
})
