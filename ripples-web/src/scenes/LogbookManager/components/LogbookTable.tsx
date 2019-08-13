import React, { Component } from 'react'
import { Button, Table } from 'reactstrap'
import IAnnotation from '../../../model/IAnnotations'
import { ILogbook } from '../../../model/MyLogbook'
import DateService from '../../../services/DateUtils'

interface PropsType {
  logbooks: ILogbook[]
  activeLogbookName: string
  selectedLogbookName: string
  logbookHasAnnotations: (logbookName: string) => boolean
  enableAddAnnotation: () => void
  enableEditAnnotation: (logbookIndex: number, annotationIndex: number) => void
  onDeleteAnnotation: (annotationId: number, annotationIndex: number) => void
}

export default class LogbookTable extends Component<PropsType, {}> {
  public render() {
    return (
      <>
        <div id="active-logbook">
          <h5 className="mr-2">Active Logbook: {this.props.activeLogbookName}</h5>
          <Button
            id="addAnnotationBtn"
            className="btn btn-sm m-1"
            color="primary"
            onClick={this.props.enableAddAnnotation}
          >
            Add Annotation
          </Button>
        </div>
        <div id="selected-logbook">
          <h5>Selected Logbook: {this.props.selectedLogbookName}</h5>
        </div>
        {this.props.logbookHasAnnotations(this.props.selectedLogbookName) ? (
          <Table id="logbook-table" responsive striped>
            <thead>
              <tr className="d-flex">
                <th className="col-3">Creation Date</th>
                <th className="col-2">Coordinates</th>
                <th className="col-5">Content</th>
                <th className="col-2">Actions</th>
              </tr>
            </thead>
            <tbody>{this.buildAnnotationRows()}</tbody>
          </Table>
        ) : (
          <strong className="pl-1">No annotations available!</strong>
        )}
      </>
    )
  }

  private buildAnnotationRows() {
    const index = this.props.logbooks.findIndex((lb: ILogbook) => lb.name === this.props.selectedLogbookName)
    if (index !== -1) {
      const annotations = this.props.logbooks[index].annotations.map((ann: IAnnotation, i) => {
        return (
          <tr key={ann.id} className="d-flex">
            <td className="col-3">{DateService.timestampMsToReadableDate(ann.date)}</td>
            <td className="col-2">
              {!ann.latitude || !ann.longitude
                ? 'Unavailable'
                : ann.latitude.toFixed(5) + 'º ' + ann.longitude.toFixed(5) + 'º'}
            </td>
            <td className="col-5">{ann.content}</td>
            <td className="col-2">
              <i
                title={`Edit annotation ${ann.id}`}
                className="fas fa-edit mr-2"
                onClick={() => this.props.enableEditAnnotation(index, i)}
              />
              <i
                title={`Delete annotation ${ann.id}`}
                className="fas fa-trash ml-2"
                onClick={() => this.props.onDeleteAnnotation(ann.id, i)}
              />
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
}
