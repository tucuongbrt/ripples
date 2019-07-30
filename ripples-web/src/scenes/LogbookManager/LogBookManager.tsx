import React, { Component } from 'react'
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAnnotation from '../../model/IAnnotations'
import MyLogbook, { ILogbook } from '../../model/MyLogbook'
import DateService from '../../services/DateUtils'
import LogbookService from '../../services/LogbookUtils'
import './styles/Logbook.css'
const { NotificationManager } = require('react-notifications')

interface StateType {
  logbookName: string
  logbooks: ILogbook[]
  activeLogbookName: string
  selectedLogbookName: string
  isLogbookEntriesOpen: boolean
}

export default class LogbookManager extends Component<{}, StateType> {
  private logbookService: LogbookService = new LogbookService()
  public constructor(props: any) {
    super(props)
    this.state = {
      logbookName: '',
      logbooks: [],
      activeLogbookName: '',
      selectedLogbookName: '',
      isLogbookEntriesOpen: false,
    }
    this.onAddLogbook = this.onAddLogbook.bind(this)
    this.toggleLogbookTable = this.toggleLogbookTable.bind(this)
  }

  public async componentDidMount() {
    const data = await this.logbookService.fetchLogbooksInfo()
    this.setState({ logbooks: data })
    if (this.state.logbooks.length > 0) {
      const logbookName = this.state.logbooks[0].name
      this.setState({ activeLogbookName: logbookName, selectedLogbookName: logbookName })
    }
  }

  public render() {
    return (
      <>
        <SimpleNavbar />
        <Container>
          <Form id="add-logbook-form" inline={true}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="logbookName" className="mr-sm-2">
                Logbook Name
              </Label>
              <Input
                type="text"
                name="mapName"
                id="mapName"
                onChange={evt => this.setState({ logbookName: evt.target.value })}
                value={this.state.logbookName}
              />
            </FormGroup>
            <Button id="addLogbookBtn" onClick={this.onAddLogbook}>
              Add Logbook
            </Button>
          </Form>
          {this.state.selectedLogbookName !== '' ? (
            <>
              <div id="logbooks-info">
                <h5>Active Logbook: {this.state.activeLogbookName}</h5>
                <h5>Selected Logbook: {this.state.selectedLogbookName}</h5>
              </div>
              <Table responsive={true}>
                <thead>
                  <tr>
                    <th>Annotation ID</th>
                    <th>Creation Date</th>
                    <th>Coordinates</th>
                    <th>Content</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{this.buildLogbookRows()}</tbody>
              </Table>
            </>
          ) : (
            <h5>There is currently no logbook available!</h5>
          )}
          <Table id="logbook-entries" responsive={true}>
            {this.state.isLogbookEntriesOpen ? (
              <>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Logbook Name</th>
                    <th>Creation Date</th>
                  </tr>
                </thead>
                <tbody>{this.buildRows()}</tbody>
              </>
            ) : (
              <thead>
                <tr id="open-logs" onClick={this.toggleLogbookTable}>
                  <th>View oldest logbooks</th>
                </tr>
              </thead>
            )}
          </Table>
          {this.state.isLogbookEntriesOpen ? (
            <div id="close-logs-btn">
              <Button className="m-1" color="info" onClick={this.toggleLogbookTable}>
                Close Logs
              </Button>
            </div>
          ) : (
            ''
          )}
        </Container>
      </>
    )
  }

  private toggleLogbookTable() {
    this.setState({ isLogbookEntriesOpen: !this.state.isLogbookEntriesOpen })
  }

  private buildLogbookRows() {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.selectedLogbookName)
    if (index !== -1) {
      const annotations = this.state.logbooks[index].annotations.map((ann: IAnnotation, i) => {
        return (
          <tr key={ann.id}>
            <th scope="row">{ann.id}</th>
            <td>{DateService.timestampMsToReadableDate(ann.date)}</td>
            <td>
              {ann.latitude.toFixed(5)}º {ann.longitude.toFixed(5)}º
            </td>
            <td>{ann.content}</td>
            <td onClick={() => this.onDeleteAnnotation(ann.id,i)}>
              <i title={`Delete ${ann.id}`} className="fas fa-trash" />
            </td>
          </tr>
        )
      })
      if (annotations.length > 0) {
        return annotations
      } else {
        return (
          <tr key="info">
            <th scope="row">No annotations available!</th>
          </tr>
        )
      }
    }
  }

  private buildRows() {
    return this.state.logbooks.map((lb: ILogbook, i) => {
      return (
        <tr
          key={lb.name}
          className={this.state.selectedLogbookName === lb.name ? 'selectedLogbook' : ''}
          onClick={() => this.setState({ selectedLogbookName: lb.name })}
        >
          <th scope="row">{this.state.logbooks.length - i}</th>
          <td>{lb.name}</td>
          <td>{DateService.timestampMsToReadableDate(lb.date)}</td>
        </tr>
      )
    })
  }

  private async onAddLogbook() {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.logbookName)
    if (this.state.logbookName === '') {
      NotificationManager.warning('Invalid logbook name!')
      return
    } else if (index !== -1) {
      NotificationManager.error('Logbook already exists!')
      return
    }
    try {
      const newLogbook = new MyLogbook(this.state.logbookName, Date.now())
      const response = await this.logbookService.addLogbook(newLogbook)
      this.setState({
        logbooks: [newLogbook, ...this.state.logbooks],
        logbookName: '',
        activeLogbookName: newLogbook.name,
        selectedLogbookName: newLogbook.name
      })
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private async onDeleteAnnotation(annotationId: number, annotationIndex: number) {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.selectedLogbookName)
    if (index === -1) {
      return
    }
    try {
      const response = await this.logbookService.deleteAnnotation(annotationId, this.state.selectedLogbookName)
      const logbookCopy = JSON.parse(JSON.stringify(this.state.logbooks[index]))
      logbookCopy.annotations.splice(annotationIndex,1)
      const logbooksCopy = JSON.parse(JSON.stringify(this.state.logbooks))
      logbooksCopy.splice(index,1,logbookCopy)
      this.setState({
        logbooks: logbooksCopy
      })
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }
}
