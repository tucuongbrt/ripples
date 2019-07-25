import React, { Component } from 'react'
import { Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import ITextMessage from '../../model/ITextMessage'
import { timestampMsToReadableDate } from '../../services/DateUtils'
import hexToAscii from '../../services/HexToAscii'
import { fetchTextMessages } from '../../services/Rock7Utils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  messages: ITextMessage[]
  isNavOpen: boolean
}

/**
 * Display iridium / rock7 plain text messages
 */
export default class TextMessages extends Component<{}, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: true,
      messages: [],
    }
    this.updateMessages = this.updateMessages.bind(this)
  }

  public componentDidMount() {
    this.updateMessages()
    this.timerID = window.setInterval(this.updateMessages, 60000)
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public updateMessages() {
    fetchTextMessages()
      .then(data => {
        const messages = data.map((m: any) =>
          Object.assign({}, m, {
            date: timestampMsToReadableDate(m.updated_at),
            msg: hexToAscii(m.msg),
          })
        )
        this.setState({ messages: messages.reverse() })
      })
      .catch(_ => {
        NotificationManager.warning('Failed to fetch text messages')
      })
  }

  public renderMessage(textMsg: ITextMessage) {
    return (
      <tr key={textMsg.updated_at}>
        <td>{textMsg.date}</td>
        <td>{textMsg.msg}</td>
      </tr>
    )
  }

  public renderMessages() {
    return this.state.messages.map(msg => this.renderMessage(msg))
  }
  public render() {
    return (
      <>
        <SimpleNavbar />
        <div>
          <Table responsive={true}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>{this.renderMessages()}</tbody>
          </Table>
        </div>
      </>
    )
  }
}
