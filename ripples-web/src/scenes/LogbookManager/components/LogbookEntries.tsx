import React, { Component } from 'react'
import { Button, Table } from 'reactstrap'
import { ILogbook } from '../../../model/MyLogbook'
import DateService from '../../../services/DateUtils'

interface PropsType {
  logbooks: ILogbook[]
  selectedLogbookName: string
  isLogbookEntriesOpen: boolean
  toggleLogbookTable: () => void
  onDeleteLogbook: (logbookName: string) => void
  savePreviousLogbook: (logbookName: string) => void
  onExportHtml: (logbook: ILogbook) => void
}

export default class LogbookEntries extends Component<PropsType, {}> {
  public render() {
    return (
      <>
        <div id="logbook-entries-header">
          <h5 className="mt-5 mr-2">Logbook entries</h5>
          {this.props.isLogbookEntriesOpen ? (
            <Button className="btn btn-secondary btn-sm m-1" onClick={this.props.toggleLogbookTable}>
              Close Logs
            </Button>
          ) : (
            <Button className="btn btn-sm m-1" color="secondary" onClick={this.props.toggleLogbookTable}>
              Open Logs
            </Button>
          )}
        </div>
        <Table id="logbook-entries" responsive={true} hover>
          {this.props.isLogbookEntriesOpen ? (
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
              <tbody>{this.buildLogbookRows()}</tbody>
            </>
          ) : (
            <></>
          )}
        </Table>
      </>
    )
  }

  private buildLogbookRows() {
    return this.props.logbooks.map((lb: ILogbook, i) => {
      return (
        <tr
          key={lb.name}
          className={this.props.selectedLogbookName === lb.name ? 'selectedLogbook' : ''}
          onClick={() => this.props.savePreviousLogbook(lb.name)}
        >
          <th scope="row">{this.props.logbooks.length - i}</th>
          <td>{lb.name}</td>
          <td>{DateService.timestampMsToReadableDate(lb.date)}</td>
          <td>
            <i
              title={`Export logbook ${lb.name}`}
              className="fas fa-download"
              onClick={() => this.props.onExportHtml(lb)}
            />
          </td>
          <td>
            <i
              title={`Delete logbook ${lb.name}`}
              className="fas fa-trash"
              onClick={() => this.props.onDeleteLogbook(lb.name)}
            />
          </td>
        </tr>
      )
    })
  }
}
