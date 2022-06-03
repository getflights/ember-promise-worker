import EPWorker from '../../app/objects/EPWorker'

const worker = new EPWorker()

worker.register(async (message) => {
  return message;
})
