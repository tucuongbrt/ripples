import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOMServer from 'react-dom/server'
import {
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAnnotation, { Annotation, DefaultAnnotation, INewAnnotation } from '../../model/IAnnotations'
import IAuthState, { IUser } from '../../model/IAuthState'
import ILatLng, { inRange } from '../../model/ILatLng'
import IRipplesState from '../../model/IRipplesState'
import MyLogbook, { ILogbook } from '../../model/MyLogbook'
import { setUser } from '../../redux/ripples.actions'
import DateService from '../../services/DateUtils'
import LogbookService from '../../services/LogbookUtils'
import { getCurrentUser } from '../../services/UserUtils'
import LogbookEntries from './components/LogbookEntries'
import LogbookTable from './components/LogbookTable'
import './styles/Logbook.css'
const { NotificationManager } = require('react-notifications')

interface StateType {
  logbookName: string
  logbooks: ILogbook[]
  activeLogbookName: string
  selectedLogbookName: string
  prevSelectedLogbookName: string
  isLogbookEntriesOpen: boolean
  isAnnotationModalOpen: boolean
  newAnnotation: INewAnnotation
  editAnnotation?: IAnnotation
  modalType?: ModalType
}

enum ModalType {
  ADD_ANNOTATION,
  EDIT_ANNOTATION,
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

export class LogbookManager extends Component<PropsType, StateType> {
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
      isAnnotationModalOpen: false,
      newAnnotation: DefaultAnnotation,
    }
    this.onAddLogbook = this.onAddLogbook.bind(this)
    this.onDeleteLogbook = this.onDeleteLogbook.bind(this)
    this.onAddAnnotation = this.onAddAnnotation.bind(this)
    this.onEditAnnotation = this.onEditAnnotation.bind(this)
    this.onDeleteAnnotation = this.onDeleteAnnotation.bind(this)
    this.enableAddAnnotation = this.enableAddAnnotation.bind(this)
    this.enableEditAnnotation = this.enableEditAnnotation.bind(this)
    this.toggleLogbookTable = this.toggleLogbookTable.bind(this)
    this.toggleAnnotationModal = this.toggleAnnotationModal.bind(this)
    this.logbookHasAnnotations = this.logbookHasAnnotations.bind(this)
    this.savePreviousLogbook = this.savePreviousLogbook.bind(this)
    this.onExportHtml = this.onExportHtml.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
  }

  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }

  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
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
            <FormGroup className="mb-2 mr-2">
              <Label for="logbookName" className="mr-2">
                Logbook Name
              </Label>
              <Input
                type="text"
                name="mapName"
                id="mapName"
                onChange={(evt) => this.setState({ logbookName: evt.target.value })}
                value={this.state.logbookName}
              />
            </FormGroup>
            <Button id="addLogbookBtn" color="primary" onClick={this.onAddLogbook}>
              Add Logbook
            </Button>
          </Form>
          {this.state.selectedLogbookName !== '' ? (
            <>
              <LogbookTable
                logbooks={this.state.logbooks}
                activeLogbookName={this.state.activeLogbookName}
                selectedLogbookName={this.state.selectedLogbookName}
                logbookHasAnnotations={this.logbookHasAnnotations}
                enableAddAnnotation={this.enableAddAnnotation}
                enableEditAnnotation={this.enableEditAnnotation}
                onDeleteAnnotation={this.onDeleteAnnotation}
              />
              {this.buildAnnotationModal()}
            </>
          ) : (
            <span className="m-auto">There is currently no logbook available!</span>
          )}
          <LogbookEntries
            logbooks={this.state.logbooks}
            selectedLogbookName={this.state.selectedLogbookName}
            isLogbookEntriesOpen={this.state.isLogbookEntriesOpen}
            toggleLogbookTable={this.toggleLogbookTable}
            onDeleteLogbook={this.onDeleteLogbook}
            savePreviousLogbook={this.savePreviousLogbook}
            onExportHtml={this.onExportHtml}
          />
        </Container>
      </>
    )
  }

  private buildAnnotationModal() {
    return (
      <Modal isOpen={this.state.isAnnotationModalOpen} toggle={this.toggleAnnotationModal}>
        <ModalHeader toggle={this.toggleAnnotationModal}>
          {this.state.modalType === ModalType.ADD_ANNOTATION ? 'Add annotation' : 'Edit annotation'}
        </ModalHeader>
        <ModalBody>
          {this.state.modalType === ModalType.EDIT_ANNOTATION && this.state.editAnnotation ? (
            <>
              <Label for="creationDate">Creation Date: </Label>
              <h5 id="creationDate">{DateService.timestampMsToReadableDate(this.state.editAnnotation.date)}</h5>
              <Label for="annLatitude">Latitude</Label>
              <Input
                id="annLatitude"
                type="number"
                placeholder="Set annotation latitude"
                value={this.state.editAnnotation.latitude}
                onChange={(evt) => this.updateAnnotationLatitude(evt)}
              />
              <Label for="annLongitude">Longitude</Label>
              <Input
                id="annLongitude"
                type="number"
                placeholder="Set annotation longitude"
                value={this.state.editAnnotation.longitude}
                onChange={(evt) => this.updateAnnotationLongitude(evt)}
              />
              <Label for="annContent">Content</Label>
              <Input
                id="annContent"
                type="textarea"
                placeholder="Set annotation content"
                value={this.state.editAnnotation.content}
                onChange={(evt) => this.updateAnnotationContent(evt)}
              />
            </>
          ) : (
            this.state.modalType === ModalType.ADD_ANNOTATION && (
              <>
                <Label for="annLatitude">Latitude</Label>
                <Input
                  id="annLatitude"
                  type="number"
                  placeholder="Set annotation latitude"
                  onChange={(evt) => this.updateAnnotationLatitude(evt)}
                />
                <Label for="annLongitude">Longitude</Label>
                <Input
                  id="annLongitude"
                  type="number"
                  placeholder="Set annotation longitude"
                  onChange={(evt) => this.updateAnnotationLongitude(evt)}
                />
                <Label for="annContent">Content</Label>
                <Input
                  id="annContent"
                  type="textarea"
                  placeholder="Set annotation content"
                  onChange={(evt) => this.updateAnnotationContent(evt)}
                />
              </>
            )
          )}
        </ModalBody>
        <ModalFooter>
          {this.state.modalType === ModalType.EDIT_ANNOTATION && this.state.editAnnotation ? (
            <Button color="primary" onClick={this.onEditAnnotation}>
              Save changes
            </Button>
          ) : (
            <Button color="primary" onClick={this.onAddAnnotation}>
              Confirm
            </Button>
          )}
        </ModalFooter>
      </Modal>
    )
  }

  private updateAnnotationLatitude(evt: any) {
    if (this.state.modalType === ModalType.ADD_ANNOTATION) {
      const updatedAnnotation: INewAnnotation = JSON.parse(JSON.stringify(this.state.newAnnotation))
      updatedAnnotation.latitude = parseFloat(evt.currentTarget.value)
      this.setState({ newAnnotation: updatedAnnotation })
    } else if (this.state.modalType === ModalType.EDIT_ANNOTATION) {
      const updatedAnnotation: IAnnotation = JSON.parse(JSON.stringify(this.state.editAnnotation))
      updatedAnnotation.latitude = parseFloat(evt.currentTarget.value)
      this.setState({ editAnnotation: updatedAnnotation })
    }
  }

  private updateAnnotationLongitude(evt: any) {
    if (this.state.modalType === ModalType.ADD_ANNOTATION) {
      const updatedAnnotation = JSON.parse(JSON.stringify(this.state.newAnnotation))
      updatedAnnotation.longitude = parseFloat(evt.currentTarget.value)
      this.setState({ newAnnotation: updatedAnnotation })
    } else if (this.state.modalType === ModalType.EDIT_ANNOTATION) {
      const updatedAnnotation = JSON.parse(JSON.stringify(this.state.editAnnotation))
      updatedAnnotation.longitude = parseFloat(evt.currentTarget.value)
      this.setState({ editAnnotation: updatedAnnotation })
    }
  }

  private updateAnnotationContent(evt: any) {
    if (this.state.modalType === ModalType.ADD_ANNOTATION) {
      const updatedAnnotation = JSON.parse(JSON.stringify(this.state.newAnnotation))
      updatedAnnotation.content = evt.currentTarget.value
      this.setState({ newAnnotation: updatedAnnotation })
    } else if (this.state.modalType === ModalType.EDIT_ANNOTATION) {
      const updatedAnnotation = JSON.parse(JSON.stringify(this.state.editAnnotation))
      updatedAnnotation.content = evt.currentTarget.value
      this.setState({ editAnnotation: updatedAnnotation })
    }
  }

  private logbookHasAnnotations(logbookName: string) {
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === logbookName)
    return index !== -1 && this.state.logbooks[index].annotations.length > 0
  }

  private toggleLogbookTable() {
    this.setState({ isLogbookEntriesOpen: !this.state.isLogbookEntriesOpen })
  }

  private toggleAnnotationModal() {
    this.setState({ isAnnotationModalOpen: !this.state.isAnnotationModalOpen })
  }

  private enableAddAnnotation() {
    this.toggleAnnotationModal()
    this.setState({ modalType: ModalType.ADD_ANNOTATION })
  }

  private enableEditAnnotation(logbookIndex: number, annotationIndex: number) {
    this.toggleAnnotationModal()
    this.setState({
      modalType: ModalType.EDIT_ANNOTATION,
      editAnnotation: this.state.logbooks[logbookIndex].annotations[annotationIndex],
    })
  }

  private savePreviousLogbook(logbookName: string) {
    this.setState({
      prevSelectedLogbookName: this.state.selectedLogbookName,
      selectedLogbookName: logbookName,
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

  private async onAddAnnotation() {
    this.toggleAnnotationModal()
    const coordinates: ILatLng = {
      latitude: this.state.newAnnotation.latitude,
      longitude: this.state.newAnnotation.longitude,
    }
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.activeLogbookName)
    if (index === -1) {
      return
    } else if (!inRange(coordinates)) {
      NotificationManager.error('Coordinates out of range!')
      return
    } else if (this.state.newAnnotation.content === '') {
      NotificationManager.error('Content cannot be empty!')
      return
    }
    try {
      const response = await this.logbookService.addAnnotation(this.state.newAnnotation)
      const lastAnnotation = await this.logbookService.fetchLastAnnotation()
      const logbookCopy = JSON.parse(JSON.stringify(this.state.logbooks[index]))
      const newAnnotation: IAnnotation = Object.assign({}, this.state.newAnnotation, {
        id: lastAnnotation.id,
        username: lastAnnotation.username,
        date: lastAnnotation.date,
      })
      logbookCopy.annotations.push(newAnnotation)
      const logbooksCopy = JSON.parse(JSON.stringify(this.state.logbooks))
      logbooksCopy.splice(index, 1, logbookCopy)
      this.setState({
        logbooks: logbooksCopy,
        newAnnotation: DefaultAnnotation,
      })
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private async onEditAnnotation() {
    this.toggleAnnotationModal()
    const index = this.state.logbooks.findIndex((lb: ILogbook) => lb.name === this.state.selectedLogbookName)
    if (index === -1 || !this.state.editAnnotation) {
      return
    }
    try {
      const response = await this.logbookService.editAnnotation(
        new Annotation(
          this.state.editAnnotation.id,
          this.state.editAnnotation.content,
          this.state.editAnnotation.username,
          this.state.editAnnotation.date,
          this.state.editAnnotation.latitude,
          this.state.editAnnotation.longitude
        ),
        this.state.selectedLogbookName
      )
      const logbookCopy = JSON.parse(JSON.stringify(this.state.logbooks[index]))
      const annIndex = logbookCopy.annotations.findIndex(
        (ann: IAnnotation) => this.state.editAnnotation && ann.id === this.state.editAnnotation.id
      )
      logbookCopy.annotations.splice(annIndex, 1, this.state.editAnnotation)
      const logbooksCopy = JSON.parse(JSON.stringify(this.state.logbooks))
      logbooksCopy.splice(index, 1, logbookCopy)
      this.setState({
        logbooks: logbooksCopy,
        editAnnotation: undefined,
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

  private onExportHtml(logbook: ILogbook) {
    const fileName = `${logbook.name}.html`
    try {
      const fileContent = this.generateHtml(logbook)
      const data = new Blob([fileContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.setAttribute('download', fileName)
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      NotificationManager.success(fileName + ' downloaded successfully!')
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private generateHtml(logbook: ILogbook) {
    return (
      '<!DOCTYPE html>' +
      ReactDOMServer.renderToStaticMarkup(
        <html lang="en">
          <head>
            <title>Logbook {logbook.name}</title>
          </head>
          <body>
            <table>
              <thead>
                <tr>
                  <th>Creation Date</th>
                  <th>Coordinates</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {logbook.annotations.map((ann: IAnnotation) => {
                  return (
                    <tr key={ann.id}>
                      <td>{DateService.timestampMsToReadableDate(ann.date)}</td>
                      <td>
                        {!ann.latitude || !ann.longitude
                          ? 'Unavailable'
                          : ann.latitude.toFixed(5) + 'º ' + ann.longitude.toFixed(5) + 'º'}
                      </td>
                      <td>{ann.content}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </body>
        </html>
      )
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
  }
}

const actionCreators = {
  setUser,
}

export default connect(mapStateToProps, actionCreators)(LogbookManager)
