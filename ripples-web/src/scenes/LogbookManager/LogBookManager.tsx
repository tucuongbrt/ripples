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
  prevSelectedLogbookName: string
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
      prevSelectedLogbookName: '',
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
            <FormGroup className="mb-2 mr-2 mb-0">
              <Label for="logbookName" className="mr-2">
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
            this.buildLogbookTables()
          ) : (
            <h5>There is currently no logbook available!</h5>
          )}
        </Container>
      </>
    )
  }

  private buildLogbookTables() {
    return (
      <>
        <div id="logbooks-info">
          <h5>Active Logbook: {this.state.activeLogbookName}</h5>
          <h5>Selected Logbook: {this.state.selectedLogbookName}</h5>
        </div>
        {this.logbookHasAnnotations(this.state.selectedLogbookName) ? (
          <Table id="logbook-table" responsive striped>
            <thead>
              <tr className="d-flex">
                <th className="col-3">Creation Date</th>
                <th className="col-2">Coordinates</th>
                <th className="col-5">Content</th>
                <th className="col-2">Actions</th>
              </tr>
            </thead>
            <tbody>{this.buildLogbookRows()}</tbody>
          </Table>
        ) : (
          <strong className="pl-1">No annotations available!</strong>
        )}
        <div id="logbook-entries-header">
          <h5 className="mt-5 mr-2">Logbook entries</h5>
          {this.state.isLogbookEntriesOpen ? (
            <Button className="btn btn-secondary btn-sm m-1" onClick={this.toggleLogbookTable}>
              Close Logs
            </Button>
          ) : (
            <Button className="btn btn-secondary btn-sm m-1" onClick={this.toggleLogbookTable}>
              Open Logs
            </Button>
          )}
        </div>
        <Table id="logbook-entries" responsive={true} hover>
          {this.state.isLogbookEntriesOpen ? (
            <>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Creation Date</th>
                  <th>Export as HTML</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{this.buildRows()}</tbody>
            </>
          ) : (
            <></>
          )}
        </Table>
      </>
    )
  }

  private buildLogbookRows() {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.selectedLogbookName)
    if (index !== -1) {
      const annotations = this.state.logbooks[index].annotations.map((ann: IAnnotation, i) => {
        return (
          <tr key={ann.id} className="d-flex">
            <td className="col-3">{DateService.timestampMsToReadableDate(ann.date)}</td>
            <td className="col-2">
              {ann.latitude.toFixed(5)}º {ann.longitude.toFixed(5)}º
            </td>
            <td className="col-5">{ann.content}</td>
            <td className="col-2" onClick={() => this.onDeleteAnnotation(ann.id, i)}>
              <i title={`Delete annotation ${ann.id}`} className="fas fa-trash" />
            </td>
          </tr>
        )
      })
      if (annotations.length > 0) {
        return annotations
      } else {
        return []
      }
    }
  }

  private buildRows() {
    return this.state.logbooks.map((lb: ILogbook, i) => {
      return (
        <tr
          key={lb.name}
          className={this.state.selectedLogbookName === lb.name ? 'selectedLogbook' : ''}
          onClick={() =>
            this.setState({
              prevSelectedLogbookName: this.state.selectedLogbookName,
              selectedLogbookName: lb.name,
            })
          }
        >
          <th scope="row">{this.state.logbooks.length - i}</th>
          <td>{lb.name}</td>
          <td>{DateService.timestampMsToReadableDate(lb.date)}</td>
          <td>
            <i className="fas fa-download"></i>
          </td>
          <td onClick={() => this.onDeleteLogbook(lb.name)}>
            <i title={`Delete logbook ${lb.name}`} className="fas fa-trash" />
          </td>
        </tr>
      )
    })
  }

  private logbookHasAnnotations(logbookName: string) {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === logbookName)
    return index !== -1 && this.state.logbooks[index].annotations.length > 0
  }

  private toggleLogbookTable() {
    this.setState({ isLogbookEntriesOpen: !this.state.isLogbookEntriesOpen })
  }

  private async onAddLogbook() {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.logbookName)
    if (index !== -1) {
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
        selectedLogbookName: newLogbook.name,
        isLogbookEntriesOpen: true,
      })
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private async onDeleteLogbook(logbookName: string) {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === logbookName)
    if (index === -1) {
      return
    }
    try {
      const response = await this.logbookService.deleteLogbook(logbookName)
      if (this.state.logbooks.length > 1) {
        const logbooksCopy = JSON.parse(JSON.stringify(this.state.logbooks))
        logbooksCopy.splice(index, 1)
        if (this.state.activeLogbookName === logbookName || this.state.selectedLogbookName === logbookName) {
          const nextActiveLogbook = await this.logbookService.fetchLogbook()
          this.setState({
            logbooks: logbooksCopy,
            activeLogbookName: nextActiveLogbook.name,
            selectedLogbookName: nextActiveLogbook.name,
          })
        } else {
          this.setState({ logbooks: logbooksCopy, selectedLogbookName: this.state.prevSelectedLogbookName })
        }
      } else {
        this.setState({
          logbooks: [],
          activeLogbookName: '',
          selectedLogbookName: '',
        })
      }
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
      logbookCopy.annotations.splice(annotationIndex, 1)
      const logbooksCopy = JSON.parse(JSON.stringify(this.state.logbooks))
      logbooksCopy.splice(index, 1, logbookCopy)
      this.setState({
        logbooks: logbooksCopy,
      })
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }
}
