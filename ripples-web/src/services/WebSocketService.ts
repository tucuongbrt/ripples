import { Client, Message } from '@stomp/stompjs'

const WEB_SOCKETS_URL = process.env.REACT_APP_WS_URL

export function createWSClient() {
  const client = new Client({
    brokerURL: WEB_SOCKETS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })
  client.onStompError = frame => {
    // Will be invoked in case of error encountered at Broker
    alert('Broker reported error: ' + frame.headers.message)
    alert('Additional details: ' + frame.body)
  }
  return client
}

export function subscribeWSAssetUpdates(client: Client, callback: (m: Message) => any) {
  client.onConnect = frame => {
    // Do something, all subscribes must be done is this callback
    // This is needed because this will be executed after a (re)connect
    client.subscribe('/topic/asset', callback)
  }
}
