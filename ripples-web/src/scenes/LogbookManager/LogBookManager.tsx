import React, { Component } from 'react'
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import MyLogbook, { ILogbook } from '../../model/MyLogbook'
import LogbookService from '../../services/LogbookUtils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  logbookName: string
  logbooks: ILogbook[]
  activeLogbook: ILogbook
}

export default class LogbookManager extends Component<{},StateType> {
  private logbookService: LogbookService = new LogbookService()
  public constructor(props: any) {
    super(props)
    this.state = {
      logbookName: '',
      logbooks: [],
      activeLogbook: new MyLogbook('', Date.now()),
    }
    this.onAddLogbook = this.onAddLogbook.bind(this)
  }

  async componentDidMount() {
    const data = await this.logbookService.fetchLogbooksInfo()
    this.setState({ logbooks: data })
    if (this.state.logbooks.length > 0) {
      this.setState({ activeLogbook: this.state.logbooks[0] })
    }
  }

  render() {
    return (
      <>
        <SimpleNavbar />
        <Container>
          <Form inline={true}>
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
          <h4>{}</h4>
          <Table responsive={true}>
            <thead>
              <tr>
                <th>Logbook Name</th>
                <th>Logbook Creation Date</th>
                <th>Actions</th>
              </tr>
            </thead>
          </Table>
          <Table responsive={true}>
            <thead>
              <tr>
                <th>#</th>
                <th>Logbook Name</th>
                <th>Logbook Creation Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.buildRows()}
            </tbody>
          </Table>
        </Container>
      </>
    )
  }

  private buildRows() {
    return this.state.logbooks.map((lb: ILogbook, i) => {
      return (
        <tr key={lb.name}>
          <th scope="row">{i}</th>
          <td>{lb.name}</td>
          <td>{lb.creationDate}</td>
          <td onClick={() => this.onDeleteLogbook(lb.name)}>
            <i title={`Delete ${lb.name}`} className="fas fa-trash" />
          </td>
        </tr>
      )
    })
  }

  private async onAddLogbook() {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.logbookName)
    if (index !== -1) {
      NotificationManager.error('Logbook already exists!')
      return
    }
    try {
      const newLogbook = new MyLogbook(this.state.logbookName, Date.now()) 
      await this.logbookService.addLogbook(newLogbook)
      this.setState({
        logbooks: [...this.state.logbooks, newLogbook],
        logbookName: ''
      })
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }
  
  private async onDeleteLogbook(logbookName: string) {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === logbookName)
    if (index !== -1) {
      const logsCopy = JSON.parse(JSON.stringify(this.state.logbooks))
      logsCopy.splice(index, 1)
      this.setState({ logbooks: logsCopy })
      try {
        const response = await this.logbookService.deleteLogbook(logbookName)
        NotificationManager.success(response.message)
      } catch (error) {
        NotificationManager.error(error.message)
      }
    }
  }
  
  private async deleteAnnotation(logbookName: string, annotationId: number) {
    try {
      const response = await this.logbookService.deleteAnnotation(logbookName, annotationId)
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }
}