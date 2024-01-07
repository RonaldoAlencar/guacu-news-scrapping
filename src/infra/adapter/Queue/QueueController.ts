import Queue from "../../../domain/adapters/Queue"
import SendMessage from "../../../domain/adapters/SendMessage"
import News from "../../../domain/entities/News"

export default class QueueController {
  constructor(readonly queue: Queue, readonly sendTelegramMessage: SendMessage) {
    this.queue.on("news", async function (event: News) {
      await sendTelegramMessage.send(`📰 ${event.title}\n\n${event.link}\n\n${event.postedAt}`)
    })
  }
}
