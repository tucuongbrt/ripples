import React, { Component } from 'react';
import { Table, Navbar, NavbarToggler, Collapse } from 'reactstrap';
import { fetchTextMessages } from '../../services/Rock7Utils'
import hexToAscii from '../../services/HexToAscii';
import { timestampMsToReadableDate } from '../../services/DateUtils';
import ITextMessage from '../../model/ITextMessage';
import TopNavLinks from '../../components/TopNavLinks';
const { NotificationManager } = require('react-notifications');

type stateType = {
    messages: ITextMessage[]
    isNavOpen: boolean
}


/**
 * Display iridium / rock7 plain text messages
 */
export default class TextMessages extends Component<{}, stateType> {

    _notificationSystem: any = null
    timerID: number = 0

    constructor(props: any) {
        super(props)
        this.state = {
            messages: [],
            isNavOpen: true,
        }
        this.updateMessages = this.updateMessages.bind(this)
    }

    componentDidMount() {
        this.updateMessages();
        this.timerID = window.setInterval(this.updateMessages, 60000)
    }

    componentWillUnmount() {
        clearInterval(this.timerID)
    }

    onNavToggle() {
        this.setState({ isNavOpen: !this.state.isNavOpen });
    }

    updateMessages() {
        fetchTextMessages()
            .then(data => {
                let messages = data.map((m: any) =>
                    Object.assign({},
                        m,
                        {
                            date: timestampMsToReadableDate(m.updated_at),
                            msg: hexToAscii(m.msg)
                        }))
                this.setState({ messages: messages.reverse() })
            })
            .catch(_ => {
                NotificationManager.warning('Failed to fetch text messages')
            })
    }

    renderMessage(textMsg: ITextMessage) {
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
            <>
                <Navbar color="faded" light expand="md">
                    <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
                    <Collapse isOpen={this.state.isNavOpen} navbar>
                        <TopNavLinks></TopNavLinks>
                    </Collapse>
                </Navbar>
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
                </div>
            </>

        )
    }
}