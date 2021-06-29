import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { getUserDomain, isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import KMLService from '../../services/KMLService'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import { fetchDomainNames } from '../../services/DomainUtils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  mapName: string
  mapURL: string
  maps: IMap[]
  domains: string[]
  userDomain: string[]
}

interface IMap {
  url: string
  name: string
  domain: string[]
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
      domains: [],
      userDomain: [],
    }
    this.onAddMap = this.onAddMap.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.handleChangeDomain = this.handleChangeDomain.bind(this)
  }

  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }

  public async getDomains() {
    const existingDomains: string[] = await fetchDomainNames()

    const userDomainPromise = getUserDomain(this.props.auth)
    let userDomain: string[] = []
    if (userDomainPromise !== undefined) {
      userDomain = userDomainPromise
    }

    this.setState({
      domains: existingDomains,
      userDomain,
    })
  }

  public async componentWillMount() {
    await this.loadCurrentlyLoggedInUser()
    await this.updateMaps()

    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      this.getDomains()
    }
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
                {isAdministrator(this.props.auth) ? <th>Domain</th> : <></>}
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
      const URLpart1 = m.url.substring(0, m.url.length - 5).replace(/./g, '•')
      const URLpart2 = m.url.substring(m.url.length - 5, m.url.length)
      const hidedURL = URLpart1 + URLpart2

      return (
        <tr key={m.name}>
          <th scope="row">{i}</th>
          <td>{m.name}</td>
          <td>{isAdministrator(this.props.auth) ? m.url : hidedURL} </td>
          <td onClick={() => this.deleteMap(m.name)}>
            <i title={`Delete ${m.name}`} className="fas fa-trash" />
          </td>
          {isAdministrator(this.props.auth) ? (
            <td map-domain={i} map-name={m.name}>
              <div className="input-domain">
                {this.state.domains.map((d, indexOpt) => {
                  return (
                    <label key={indexOpt} className="domain-label-kml">
                      <input
                        type="checkbox"
                        className={'optDomain-' + i}
                        value={d}
                        checked={m.domain.includes(d) ? true : false}
                        onChange={this.handleChangeDomain}
                      />
                      {d}
                    </label>
                  )
                })}
              </div>
            </td>
          ) : (
            <></>
          )}
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

  private async handleChangeDomain(event: any) {
    const mapDomainId = event.target.closest('td').getAttribute('map-domain')
    const mapName = event.target.closest('td').getAttribute('map-name')

    const domains: any = document.getElementsByClassName('optDomain-' + mapDomainId)
    const domainSelected: string[] = []
    for (const domain of domains) {
      if (domain.checked) domainSelected.push(domain.value)
    }

    const response = await this.kmlService.updateMapDomain(mapName, domainSelected)
    if (response.status === 'success') {
      const maps = [...this.state.maps]
      const item = {
        ...maps[mapDomainId],
        domain: domainSelected,
      }
      maps[mapDomainId] = item
      this.setState({ maps })

      this.getDomains()

      NotificationManager.success('Updated map domain')
    } else {
      NotificationManager.success('Cannot update map domain')
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
