import React, { Component } from 'react';
import { Table } from 'reactstrap';
import {fetchTextMessages} from '../../services/Rock7Utils'
import hexToAscii from '../../services/HexToAscii';
import { NotificationContainer} from 'react-notifications';
import { createNotification } from '../../services/Notifications'
import { timestampMsToReadableDate } from '../../services/DateUtils';

/**
 * Display iridium / rock7 plain text messages
 */
export default class TextMessages extends Component {

    constructor(props){
        super(props)
        this.state = {
            messages: [],
            intervalId: -1
        }
        this.updateMessages = this.updateMessages.bind(this)
    }

    componentDidMount(){
        this.updateMessages();
        let interval = setInterval(this.updateMessages, 60000)
        this.setState({intervalId: interval})
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId)
    }

    updateMessages() {
        fetchTextMessages()
        .then(data => {
            let messages = data.map(m => 
                Object.assign(
                    m,
                    {
                        date: timestampMsToReadableDate(m.updated_at),
                        msg: hexToAscii(m.msg)
                    }))
            this.setState({messages: messages.reverse()})
        })
        .catch(error => {
            createNotification('error', "Failed to fetch text messages");
        })
    }

    renderMessage(textMsg){
        return (
            <tr key={textMsg.updated_at}>
                <td>{textMsg.date}</td>
                <td>{textMsg.msg}</td>
            </tr>
        )
    }

    renderMessages() {
        return this.state.messages.map(msg => this.renderMessage(msg))
    }
    render() {
        return (
        <div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {this.renderMessages()}
              </tbody>
            </Table>
            <NotificationContainer />
        </div>
    )
    }
}