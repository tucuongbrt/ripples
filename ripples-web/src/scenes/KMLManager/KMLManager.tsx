import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import KMLService from '../../services/KMLService'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  mapName: string
  mapURL: string
  maps: IMap[]
}

interface IMap {
  url: string
  name: string
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

export class KMLManager extends Component<PropsType, StateType> {
  private kmlService: KMLService = new KMLService()
  public constructor(props: any) {
    super(props)
    this.state = {
      mapName: '',
      mapURL: '',
      maps: [],
    }
    this.onAddMap = this.onAddMap.bind(this)
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

  public async componentWillMount() {
    await this.loadCurrentlyLoggedInUser()
    await this.updateMaps()
  }

  public async onAddMap() {
    if (this.state.mapName.length > 0 && this.state.mapURL.length > 0) {
      try {
        const response = await this.kmlService.addNewMap(this.state.mapName, this.state.mapURL)
        if (response.status === 'success') {
          NotificationManager.success(response.message)
          this.updateMaps()
          this.clearInputs()
        } else {
          NotificationManager.warning(response.message)
        }
      } catch (error) {
        NotificationManager.warning(error.message)
      }
    } else {
      NotificationManager.warning('Invalid map name or map url')
    }
  }

  public render() {
    return (
      <>
        <SimpleNavbar />
        <Container>
          <Form inline={true}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="mapName" className="mr-sm-2">
                Map Name
              </Label>
              <Input
                type="text"
                name="mapName"
                id="mapName"
                onChange={(evt) => this.setState({ mapName: evt.target.value })}
                value={this.state.mapName}
              />
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="mapURL" className="mr-sm-2">
                Map URL
              </Label>
              <Input
                type="text"
                name="mapURL"
                id="mapURL"
                onChange={(evt) => this.setState({ mapURL: evt.target.value })}
                value={this.state.mapURL}
              />
            </FormGroup>
            <Button id="addMapBtn" onClick={this.onAddMap}>
              Add Map
            </Button>
          </Form>
          <Table hover={true}>
            <thead>
              <tr>
                <th>#</th>
                <th>Map Name</th>
                <th>URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{this.buildMapsRows()}</tbody>
          </Table>
        </Container>
      </>
    )
  }

  private clearInputs() {
    this.setState({
      mapName: '',
      mapURL: '',
    })
  }

  private async updateMaps() {
    const response = await this.kmlService.fetchMapsNamesAndURLS()
    this.setState({ maps: response })
  }

  private buildMapsRows() {
    return this.state.maps.map((m, i) => {
      return (
        <tr key={m.name}>
          <th scope="row">{i}</th>
          <td>{m.name}</td>
          <td>{m.url}</td>
          <td onClick={() => this.deleteMap(m.name)}>
            <i title={`Delete ${m.name}`} className="fas fa-trash" />
          </td>
        </tr>
      )
    })
  }

  private async deleteMap(mapName: string) {
    try {
      const response = await this.kmlService.deleteMap(mapName)
      NotificationManager.success(response.message)
      this.updateMaps()
    } catch (error) {
      NotificationManager.warning(error.message)
    }
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

export default connect(mapStateToProps, actionCreators)(KMLManager)
