import React, { Component } from 'react'
import { connect } from 'react-redux'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { getUserDomain, isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState, { IAssetsGroup } from '../../model/IRipplesState'
import DateService from '../../services/DateUtils'
import { setUser, setVehicles, setSpots, setCcus } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import { fetchDomainNames } from '../../services/DomainUtils'
import IAsset from '../../model/IAsset'
import SoiService from '../../services/SoiUtils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  isNavOpen: boolean
  domains: string[]
  assetSelected: IAsset | undefined
}

interface PropsType {
  setUser: (user: IUser) => any
  setVehicles: (_: IAsset[]) => void
  setSpots: (_: IAsset[]) => void
  setCcus: (_: IAsset[]) => void
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
      assetSelected: undefined,
    }
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.updateAssets = this.updateAssets.bind(this)
    this.getAssetInfo = this.getAssetInfo.bind(this)
    this.handleAssetChangeDomain = this.handleAssetChangeDomain.bind(this)
    this.updateAssetData = this.updateAssetData.bind(this)

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

    this.setState({ assetSelected: asset })
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
              </p>

              {this.state.assetSelected && this.buildAssetContent()}
            </div>

            <div className="asset-profile-bottom">{this.buildDomainDialog()}</div>
          </div>
        </div>
      </>
    )
  }

  private buildDomainDialog() {
    if (this.props.auth.authenticated && isAdministrator(this.props.auth) && this.props.title !== undefined) {
      let asset: IAsset | undefined
      if (this.props.title.includes('ccu')) {
        asset = this.props.ccus.find((item) => item.name === this.props.title)
      } else if (this.props.title.includes('spot')) {
        asset = this.props.spots.find((item) => item.name === this.props.title)
      } else {
        asset = this.props.vehicles.find((item) => item.name === this.props.title)
      }

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

  public async handleAssetChangeDomain(event: any) {
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

  public async updateAssetData(system: IAsset, domain: string[]) {
    try {
      const newSystem: IAsset = await this.soiService.updateAssetDomain(system, domain)
      const response = await this.soiService.updateAssetDB(newSystem)

      if (response.status === 'Success') {
        NotificationManager.success(response.message)
        this.updateAssets()
      } else {
        NotificationManager.warning('Failed to update asset domain')
      }
    } catch (error) {
      NotificationManager.warning('Failed to update asset domain')
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
}

export default connect(mapStateToProps, actionCreators)(AssetProfile)
