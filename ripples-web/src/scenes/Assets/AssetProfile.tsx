import React, { Component } from 'react'
import { connect } from 'react-redux'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { getUserDomain, isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState, { IAssetsGroup } from '../../model/IRipplesState'
import DateService from '../../services/DateUtils'
import {
  setUser,
  setVehicles,
  setSpots,
  setCcus,
  setSidePanelContent,
  setSidePanelVisibility,
} from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import { fetchDomainNames } from '../../services/DomainUtils'
import IAsset from '../../model/IAsset'
import SoiService from '../../services/SoiUtils'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { Link } from 'react-router-dom'
const { NotificationManager } = require('react-notifications')

interface StateType {
  isNavOpen: boolean
  domains: string[]
  types: string[]
  typeCheckedState: boolean[]
  assetSelected: IAsset | undefined
  isRemoveAssetModalOpen: boolean
}

interface PropsType {
  setUser: (user: IUser) => any
  setVehicles: (_: IAsset[]) => void
  setSpots: (_: IAsset[]) => void
  setCcus: (_: IAsset[]) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelContent: (_: any) => void
  auth: IAuthState
  content: Map<string, string>
  title: string
  vehicles: IAsset[]
  ccus: IAsset[]
  spots: IAsset[]
  assets: IAssetsGroup
}

/**
 * Display asset information
 */
export class AssetProfile extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0
  private soiService: SoiService = new SoiService()

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: false,
      domains: [],
      types: ['AUV', 'ASV', 'WAVY_DRIFTER', 'undefined'],
      typeCheckedState: new Array(4).fill(false),
      assetSelected: undefined,
      isRemoveAssetModalOpen: false,
    }
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.updateAssets = this.updateAssets.bind(this)
    this.getAssetInfo = this.getAssetInfo.bind(this)
    this.handleAssetChangeDomain = this.handleAssetChangeDomain.bind(this)
    this.handleAssetChangeType = this.handleAssetChangeType.bind(this)
    this.updateAssetData = this.updateAssetData.bind(this)
    this.getAsset = this.getAsset.bind(this)
    this.toggleRemoveAssetModal = this.toggleRemoveAssetModal.bind(this)
    this.redirect_homepage = this.redirect_homepage.bind(this)

    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      this.getDomains()
    }
  }

  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }

  public buildAssetContent() {
    if (this.state.assetSelected !== undefined) {
      // parse type
      let assetType = 'undefined'
      if (this.state.assetSelected.type !== null) {
        assetType = this.state.assetSelected.type
      }

      // parse timestamp
      let date = this.state.assetSelected.lastState.timestamp
      if (date.toString().length > 10) {
        date = date / 1000
      }

      return (
        <ul>
          <li>
            <span className="asset-profile-field">imcID: </span>
            <span className="user-profile-value"> {this.state.assetSelected.imcid} </span>
          </li>
          <li>
            <span className="asset-profile-field">Heading: </span>
            <span className="user-profile-value"> {this.state.assetSelected.lastState.heading.toFixed(2)} </span>
          </li>
          <li>
            <span className="asset-profile-field">last update: </span>
            <span className="user-profile-value"> {DateService.timestampSecToReadableDate(date)} </span>
          </li>
          <li>
            <span className="asset-profile-field">latitude: </span>
            <span className="user-profile-value"> {this.state.assetSelected.lastState.latitude.toFixed(5)} </span>
          </li>
          <li>
            <span className="asset-profile-field">longitude: </span>
            <span className="user-profile-value"> {this.state.assetSelected.lastState.longitude.toFixed(5)} </span>
          </li>
          <li>
            <span className="asset-profile-field">plan: </span>
            <span className="user-profile-value"> {this.state.assetSelected.planId} </span>
          </li>
          <li>
            <span className="asset-profile-field">Domain: </span>
            <span className="user-profile-value">{this.parseDomains()}</span>
          </li>
          <li>
            <span className="asset-profile-field">type: </span>
            <span className="user-profile-value"> {assetType} </span>
          </li>
        </ul>
      )
    } else {
      return <></>
    }
  }

  private async getDomains() {
    const domains: string[] = await fetchDomainNames()
    this.setState({ domains })
  }

  private async updateAssets() {
    try {
      let userDomain = getUserDomain(this.props.auth)
      if (userDomain === undefined) {
        userDomain = ['undifined']
      }
      const soiPromise = this.soiService.fetchSoiData(userDomain)
      const soiData = await soiPromise
      const vehicles = soiData.vehicles
      await this.soiService.mergeAssetSettings(vehicles, this.props.auth)

      // update redux store
      this.props.setVehicles(soiData.vehicles)
      this.props.setSpots(soiData.spots)
      this.props.setCcus(soiData.ccus)
    } catch (error) {
      NotificationManager.warning('Failed to fetch data')
    }
  }

  private async getAssetInfo() {
    let asset: IAsset | undefined
    if (this.props.auth.authenticated && isAdministrator(this.props.auth) && this.props.title !== undefined) {
      if (this.props.title.includes('ccu')) {
        asset = this.props.ccus.find((item) => item.name === this.props.title)
      } else if (this.props.title.includes('spot')) {
        asset = this.props.spots.find((item) => item.name === this.props.title)
      } else {
        asset = this.props.vehicles.find((item) => item.name === this.props.title)
      }
    }

    let assetType: string = 'undefined'
    if (asset !== undefined) {
      if (asset.type !== null) {
        assetType = asset.type
      }
    }

    let updatedCheckedState: boolean[] = this.state.typeCheckedState
    this.state.types.forEach((type, i) => {
      if (type === assetType) {
        const updatedCheckedStateAux = this.state.typeCheckedState.map((item, index) => (index === i ? true : false))
        updatedCheckedState = updatedCheckedStateAux
      }
    })

    this.setState({ assetSelected: asset, typeCheckedState: updatedCheckedState })
  }

  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()

    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      if (JSON.stringify(this.props.content).length === 2) {
        NotificationManager.warning('Please asset an selected')
      }
      await this.updateAssets()
      await this.getAssetInfo()
    } else {
      NotificationManager.error('Permission required')
    }
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public toggleRemoveAssetModal() {
    this.setState((prevState) => ({
      isRemoveAssetModalOpen: !prevState.isRemoveAssetModalOpen,
    }))
  }

  public render() {
    return (
      <>
        <SimpleNavbar auth={this.props} />
        <div>
          <div className="asset-profile">
            <div id="asset-profile-left">
              <div className="asset-profile-img-wrap">
                <img src="https://rep17.lsts.pt/sites/rep17.lsts.pt/files/paragraph/IMG_7016.jpg" alt="asset" />
              </div>
            </div>

            <div id="asset-profile-right">
              <p>
                <span className="asset-profile-field">{this.props.title}</span>
                {this.props.title !== undefined && this.props.title !== 'Click on something to get info' && (
                  <>
                    <Button
                      className="asset-remove"
                      color="danger"
                      size="sm"
                      onClick={() => this.toggleRemoveAssetModal()}
                    >
                      Remove
                    </Button>
                    <Link id="homepage-link" to="/" />
                  </>
                )}
              </p>

              {this.state.assetSelected && this.buildAssetContent()}
            </div>

            {this.props.title !== undefined && this.props.title !== 'Click on something to get info' && (
              <div className="asset-profile-bottom">
                {this.buildDomainDialog()}
                {this.buildTypeDialog()}
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={this.state.isRemoveAssetModalOpen} toggle={this.toggleRemoveAssetModal}>
          <ModalHeader toggle={this.toggleRemoveAssetModal}>Remove asset</ModalHeader>
          <ModalBody>The asset will be removed permanently. Do you want to continue?</ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => this.handleDeleteAsset()}>
              Yes
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  }

  private buildDomainDialog() {
    if (this.props.auth.authenticated && isAdministrator(this.props.auth) && this.props.title !== undefined) {
      const asset: IAsset | undefined = this.getAsset()

      const domain: string[] = []
      if (asset !== undefined) {
        asset.domain.forEach((d) => {
          domain.push(d)
        })
      }

      return (
        <div className="asset-domain">
          <label className="domain-label">Domain: </label>
          {this.state.domains.map((d, index) => {
            return (
              <label className={'assetOptDomainLabel'} key={index}>
                <input
                  type="checkbox"
                  className={'assetOptDomain'}
                  value={d}
                  checked={domain.includes(d) ? true : false}
                  onChange={this.handleAssetChangeDomain}
                  asset-id={this.props.title}
                />
                {d}
              </label>
            )
          })}
        </div>
      )
    }
  }

  private buildTypeDialog() {
    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      return (
        <div className="asset-type">
          <label className="type-label">Type: </label>
          {this.state.types.map((t, index) => {
            return (
              <label className={'assetOptTypeLabel'} key={index}>
                <input
                  type="checkbox"
                  className={'assetOptType'}
                  value={t}
                  checked={this.state.typeCheckedState[index]}
                  onChange={(e) => this.handleAssetChangeType(e, index)}
                  asset-id={this.props.title}
                />
                {t}
              </label>
            )
          })}
        </div>
      )
    }
  }

  private async handleAssetChangeDomain(event: any) {
    const assetID = event.target.getAttribute('asset-id')

    let system: IAsset
    if (assetID.startsWith('spot')) {
      system = this.props.spots.filter((item) => item.name === assetID)[0]
    } else if (assetID.startsWith('ccu')) {
      system = this.props.ccus.filter((item) => item.name === assetID)[0]
    } else {
      system = this.props.vehicles.filter((item) => item.name === assetID)[0]
    }

    const domains: any = document.getElementsByClassName('assetOptDomain')
    const domainSelected: string[] = []
    for (const domain of domains) {
      if (domain.checked) domainSelected.push(domain.value)
    }

    this.updateAssetData(system, domainSelected)
  }

  private async handleAssetChangeType(event: any, changedIndex: any) {
    const updatedCheckedState = this.state.typeCheckedState.map((item, index) =>
      index === changedIndex ? !item : false
    )
    const assetID = event.target.getAttribute('asset-id')
    const asset: IAsset | undefined = this.getAssetWithId(assetID)
    this.setState({ typeCheckedState: updatedCheckedState }, () => this.updateAssetTypeData(asset))
  }

  private async updateAssetData(system: IAsset, domain: string[]) {
    try {
      const newSystem: IAsset = await this.soiService.updateAssetDomain(system, domain)
      const response = await this.soiService.updateAssetDB(newSystem)

      if (response.status === 'Success') {
        NotificationManager.success(response.message)
        await this.updateAssets()
        await this.getAssetInfo()
      } else {
        NotificationManager.warning('Failed to update asset domain')
      }
    } catch (error) {
      NotificationManager.warning('Failed to update asset domain')
    }
  }

  private async updateAssetTypeData(system: IAsset) {
    const typeSelected: string = this.state.types[this.state.typeCheckedState.indexOf(true)]
    try {
      const newSystem: IAsset = await this.soiService.updateAssetType(system, typeSelected)
      const response = await this.soiService.updateAssetTypeDB(newSystem, typeSelected)

      if (response.status === 'Success') {
        NotificationManager.success(response.message)
        await this.updateAssets()
        await this.getAssetInfo()
      } else {
        NotificationManager.warning('Failed to update asset domain')
      }
    } catch (error) {
      NotificationManager.warning('Failed to update asset domain')
    }
  }

  private getAsset() {
    let asset: IAsset | undefined
    if (this.props.title.includes('ccu')) {
      asset = this.props.ccus.find((item) => item.name === this.props.title)
    } else if (this.props.title.includes('spot')) {
      asset = this.props.spots.find((item) => item.name === this.props.title)
    } else {
      asset = this.props.vehicles.find((item) => item.name === this.props.title)
    }

    return asset
  }

  private getAssetWithId(assetID: any) {
    let system: IAsset | undefined
    if (assetID.startsWith('spot')) {
      system = this.props.spots.filter((item) => item.name === assetID)[0]
    } else if (assetID.startsWith('ccu')) {
      system = this.props.ccus.filter((item) => item.name === assetID)[0]
    } else {
      system = this.props.vehicles.filter((item) => item.name === assetID)[0]
    }
    return system
  }

  private async handleDeleteAsset() {
    if (this.state.assetSelected !== undefined) {
      try {
        const response = await this.soiService.deleteAsset(this.state.assetSelected.name)
        if (response.status === 'Success') {
          const assetsUpdated: IAsset[] = []
          if (this.state.assetSelected.name.startsWith('spot')) {
            this.props.spots.forEach((spot) => {
              if (this.state.assetSelected !== undefined && spot.name !== this.state.assetSelected.name) {
                assetsUpdated.push(spot)
              }
            })
            this.props.setSpots(assetsUpdated)
          } else if (this.state.assetSelected.name.startsWith('ccu')) {
            this.props.ccus.forEach((ccu) => {
              if (this.state.assetSelected !== undefined && ccu.name !== this.state.assetSelected.name) {
                assetsUpdated.push(ccu)
              }
            })
            this.props.setCcus(assetsUpdated)
          } else {
            this.props.vehicles.forEach((vehicle) => {
              if (this.state.assetSelected !== undefined && vehicle.name !== this.state.assetSelected.name) {
                assetsUpdated.push(vehicle)
              }
            })
            this.props.setVehicles(assetsUpdated)
          }

          NotificationManager.success(response.message)
        } else {
          NotificationManager.error(response.message)
        }
      } catch (error) {
        NotificationManager.error('Cannot delete asset')
      }
    }
    this.setState({ assetSelected: undefined })
    this.props.setSidePanelVisibility(false)
    this.props.setSidePanelContent({})
    this.toggleRemoveAssetModal()
    this.redirect_homepage()
  }

  private redirect_homepage() {
    const userLink = document.getElementById('homepage-link')
    if (userLink !== null) {
      userLink.click()
    }
  }

  private parseDomains() {
    if (this.state.assetSelected !== undefined) {
      const lastPosition = this.state.assetSelected.domain.length - 1
      let domainParsed = ''
      this.state.assetSelected.domain.forEach((item, index) => {
        if (index !== lastPosition) {
          domainParsed = domainParsed.concat(item, ', ')
        } else {
          domainParsed = domainParsed.concat(item)
        }
      })
      return domainParsed
    } else {
      return <></>
    }
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
    content: state.sidePanelContent,
    title: state.sidePanelTitle,
    vehicles: state.assets.vehicles,
    ccus: state.assets.ccus,
    spots: state.assets.spots,
  }
}

const actionCreators = {
  setUser,
  setVehicles,
  setSpots,
  setCcus,
  setSidePanelVisibility,
  setSidePanelContent,
}

export default connect(mapStateToProps, actionCreators)(AssetProfile)
