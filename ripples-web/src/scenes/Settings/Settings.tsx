import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Collapse, Modal, ModalBody, ModalHeader, Nav, Navbar, NavbarToggler } from 'reactstrap'
import IAuthState, { isAdministrator, isCasual, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import SettingsService from '../../services/SettingsUtils'
import { fetchDomainNames } from '../../services/DomainUtils'
import TopNavLinks from '../../components/TopNavLinks'
import Login from '../../components/Login'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
const { NotificationManager } = require('react-notifications')

interface StateType {
  isNavOpen: boolean
  systemSettings: ISettings[]
  settingInputElem: any | null
  settingInputValue: string
  isSettingModalOpen: boolean
  isNewSettingModalOpen: boolean
  isParamConfirmModalOpen: boolean
  isConfirmModalOpen: boolean
  settingId: string
  settingDomainName: string
  settingParamName: string
  settingNewInputTitle: string
  settingNewInputValue: string
  settingNewInputDomain: string
  domains: string[]
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

interface ISettings {
  id: string
  name: string
  params: string[][]
}

export class Settings extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0
  private settingsService: SettingsService = new SettingsService()

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: false,
      systemSettings: [],
      settingInputElem: null,
      settingInputValue: '',
      isSettingModalOpen: false,
      isNewSettingModalOpen: false,
      isConfirmModalOpen: false,
      isParamConfirmModalOpen: false,
      settingId: '',
      settingDomainName: '',
      settingParamName: '',
      settingNewInputTitle: '',
      settingNewInputValue: '',
      settingNewInputDomain: '',
      domains: [],
    }
    this.fetchSettings = this.fetchSettings.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.toggleSettingModal = this.toggleSettingModal.bind(this)
    this.toggleNewDomainSettingModal = this.toggleNewDomainSettingModal.bind(this)
  }

  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }

  private async getDomains() {
    const domains: string[] = await fetchDomainNames()

    this.setState({
      domains,
    })
  }

  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
    if (!(this.props.auth.authenticated && isAdministrator(this.props.auth))) {
      NotificationManager.error('Only available for administrators')
    } else {
      this.getDomains()
      this.fetchSettings()
      this.timerID = window.setInterval(this.fetchSettings, 60000)
    }
    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      this.getDomains()
    }
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public async createSetting() {
    if (this.state.settingNewInputTitle.length > 0 && this.state.settingNewInputValue.length > 0) {
      const response = await this.settingsService.updateSettings(
        this.state.settingId,
        this.state.settingNewInputTitle,
        this.state.settingNewInputValue
      )
      if (response.status === 'Success') {
        this.setState({
          settingId: '',
          settingNewInputTitle: '',
          settingNewInputValue: '',
        })

        this.toggleSettingModal('', '')
        this.fetchSettings()

        NotificationManager.success('Setting created')
      } else {
        NotificationManager.warning('Cannot add new setting')
      }
    } else {
      NotificationManager.warning('Please complete all the information')
    }
  }

  public async createDomainSetting() {
    if (this.state.settingNewInputDomain.length > 0) {
      const response = await this.settingsService.createSettingDomain(this.state.settingNewInputDomain)
      if (response.status === 'Success') {
        this.setState({ settingNewInputDomain: '' })
        this.toggleNewDomainSettingModal()
        this.fetchSettings()

        NotificationManager.success('Setting domain created')
      } else {
        NotificationManager.warning('Cannot create setting domain')
      }
    } else {
      NotificationManager.warning('Please complete all the information')
    }
  }

  public async fetchSettings() {
    const response: ISettings[] = await this.settingsService.fetchSettings()
    this.setState({ systemSettings: response })
  }

  public toggleSettingModal(id: string, domainName: string) {
    this.setState({
      isSettingModalOpen: !this.state.isSettingModalOpen,
      settingId: id,
      settingDomainName: domainName,
    })

    if (id.length === 0) {
      this.setState({
        settingNewInputTitle: '',
        settingNewInputValue: '',
      })
    }
  }

  public toggleNewDomainSettingModal() {
    this.setState({
      isNewSettingModalOpen: !this.state.isNewSettingModalOpen,
    })
  }

  public toggleConfirmModal(id: string) {
    this.setState({
      settingId: id,
      isConfirmModalOpen: !this.state.isConfirmModalOpen,
    })
  }

  public toggleParamConfirmModal(id: string, paramName: string) {
    this.setState({
      settingId: id,
      settingParamName: paramName,
      isParamConfirmModalOpen: !this.state.isParamConfirmModalOpen,
    })
  }

  public enableInputSetting(event: any, settingId: string, index: number) {
    const inputElem: any = document.getElementById('setting-' + settingId + '-' + index)

    if (inputElem != null) {
      this.setState({
        settingInputElem: inputElem,
        settingInputValue: inputElem.value,
      })
    } else {
      this.setState({
        settingInputElem: null,
        settingInputValue: '',
      })
    }
  }

  public async updateSetting(settingId: any, settingParamName: string, index: number) {
    let newSettingValue = this.state.settingInputValue

    if (settingParamName === 'Display assets') {
      const inputElem: any = document.getElementById('setting-' + settingId + '-' + index)
      newSettingValue = inputElem.value
    }

    const response = await this.settingsService.updateSettings(settingId, settingParamName, newSettingValue)
    if (response.status === 'Success') {
      this.setState({
        settingInputElem: null,
        settingInputValue: '',
      })
      this.fetchSettings()

      NotificationManager.success('Settings updated')
    } else {
      NotificationManager.warning('Cannot update settings')
    }
  }

  public async removeSetting() {
    const response = await this.settingsService.removeParam(this.state.settingId, this.state.settingParamName)
    if (response.status === 'Success') {
      this.fetchSettings()
      NotificationManager.success('Setting param removed')
    } else {
      NotificationManager.warning('Cannot remove setting param')
    }

    this.setState({
      settingId: '',
      settingParamName: '',
      isParamConfirmModalOpen: !this.state.isParamConfirmModalOpen,
    })
  }

  public async removeSettingDomain() {
    const response = await this.settingsService.removeSettingDomain(this.state.settingId)
    if (response.status === 'Success') {
      this.fetchSettings()
      NotificationManager.success('Setting domain removed')
    } else {
      NotificationManager.warning('Cannot remove setting domain')
    }
    this.toggleConfirmModal('')
    this.setState({ settingId: '' })
  }

  private setSelectedDate(date: Date) {
    const auxDate = new Date(date.setMonth(date.getMonth() + 1))
    const newDate = auxDate.getDate() + '/' + auxDate.getMonth() + '/' + auxDate.getFullYear()
    this.setState({ settingInputValue: newDate })
  }

  public renderSetting(setting: ISettings) {
    return (
      <div key={setting.id} className="settings-group">
        <div>
          <h3 className="settings-group-title">{setting.name}</h3>

          {setting.name !== 'Ripples' ? (
            <i
              className="fas fa-trash"
              title="Remove domain"
              onClick={(event) => this.toggleConfirmModal(setting.id)}
            />
          ) : (
            <></>
          )}

          <Button
            className="setting-group-add"
            color="info"
            onClick={() => this.toggleSettingModal(setting.id, setting.name)}
          >
            Add param
          </Button>
        </div>

        <div className="settings-params-group">
          {setting.params.map((set, index) => {
            const dateValue = set[1].split('/')
            return this.state.settingInputElem &&
              this.state.settingInputElem.id === 'setting-' + setting.id + '-' + index ? (
              <div key={index} className="setting-row" setting-input={'setting-' + setting.id + '-' + index}>
                <span className="setting-title">{set[0]}</span>
                {setting.name === 'Ripples' && set[0] === 'Current domain' ? (
                  <>
                    <span className="setting-title-description">
                      {'Available domains: ' + this.state.domains + " (separate the domains by ',')"}
                    </span>
                  </>
                ) : (
                  <></>
                )}
                {setting.name === 'Ripples' && set[0] === 'Display assets' ? (
                  <DatePicker
                    id={'setting-' + setting.id + '-' + index}
                    className="setting-input-date"
                    selected={
                      new Date(
                        parseInt(this.state.settingInputValue.split('/')[2], 10),
                        parseInt(this.state.settingInputValue.split('/')[1], 10) - 1,
                        parseInt(this.state.settingInputValue.split('/')[0], 10)
                      )
                    }
                    onChange={(newDate: Date) => this.setSelectedDate(newDate)}
                    dateFormat="dd/MM/yyyy"
                    timeCaption="time"
                    disabled={false}
                  />
                ) : (
                  <input
                    type="text"
                    className="setting-input"
                    id={'setting-' + setting.id + '-' + index}
                    value={this.state.settingInputValue}
                    onChange={(event) => this.setState({ settingInputValue: event.target.value })}
                    disabled={false}
                  />
                )}
                <i
                  className="fas fa-check"
                  title="Update params"
                  onClick={() => this.updateSetting(setting.id, set[0], index)}
                />
              </div>
            ) : (
              <div key={index} className="setting-row" setting-input={'setting-' + setting.id + '-' + index}>
                <span className="setting-title">{set[0]}</span>

                {setting.name === 'Ripples' && set[0] === 'Current domain' ? (
                  <>
                    <span className="setting-title-description">
                      {'Available domains: ' + this.state.domains + " (separate the domains by ',')"}
                    </span>
                  </>
                ) : (
                  <></>
                )}

                {setting.name === 'Ripples' && set[0] === 'Display assets' ? (
                  <div className="setting-input-date-div">
                    <DatePicker
                      id={'setting-' + setting.id + '-' + index}
                      className="setting-input-date"
                      selected={
                        new Date(parseInt(dateValue[2], 10), parseInt(dateValue[1], 10) - 1, parseInt(dateValue[0], 10))
                      }
                      onChange={() => undefined}
                      dateFormat="dd/MM/yyyy"
                      timeCaption="time"
                      disabled={true}
                    />
                  </div>
                ) : (
                  <input
                    id={'setting-' + setting.id + '-' + index}
                    className="setting-input"
                    type="text"
                    disabled={true}
                    value={set[1] === '""' ? '' : set[1]}
                  />
                )}

                <i
                  className="fas fa-pencil-alt"
                  title="Edit param"
                  onClick={(event) => this.enableInputSetting(event, setting.id, index)}
                />
                {setting.name === 'Ripples' && set[0] === 'Current domain' ? (
                  <></>
                ) : (
                  <i
                    className="fas fa-trash"
                    title="Remove param"
                    onClick={(event) => this.toggleParamConfirmModal(setting.id, set[0])}
                  />
                )}
              </div>
            )
          })}
        </div>

        <Modal isOpen={this.state.isNewSettingModalOpen}>
          <ModalHeader toggle={this.toggleNewDomainSettingModal}> New domain group </ModalHeader>
          <ModalBody>
            <input
              type="text"
              className="setting-modal-input-new"
              placeholder="Domain name"
              value={this.state.settingNewInputDomain}
              onChange={(event) => this.setState({ settingNewInputDomain: event.target.value })}
            />
            <Button color="success" onClick={() => this.createDomainSetting()}>
              Create
            </Button>
          </ModalBody>
        </Modal>

        <Modal isOpen={this.state.isSettingModalOpen}>
          <ModalHeader toggle={() => this.toggleSettingModal('', '')}>
            {' '}
            {this.state.settingDomainName} : Create new param{' '}
          </ModalHeader>
          <ModalBody>
            <div className="setting-modal-input-group">
              <input
                type="text"
                className="setting-modal-input"
                placeholder="Param title"
                value={this.state.settingNewInputTitle}
                onChange={(event) => this.setState({ settingNewInputTitle: event.target.value })}
              />
              <label className="setting-modal-input"> : </label>
              <input
                type="text"
                className="setting-modal-input"
                placeholder="Param value"
                value={this.state.settingNewInputValue}
                onChange={(event) => this.setState({ settingNewInputValue: event.target.value })}
              />
            </div>
            <Button color="success" onClick={() => this.createSetting()}>
              Create
            </Button>
          </ModalBody>
        </Modal>

        <Modal isOpen={this.state.isConfirmModalOpen}>
          <ModalHeader toggle={() => this.toggleConfirmModal('')}> Remove domain group </ModalHeader>
          <ModalBody>
            <div> All the settings from domain selected will be removed. Do you want to continue?</div>
            <Button color="danger" onClick={() => this.removeSettingDomain()}>
              Remove
            </Button>
          </ModalBody>
        </Modal>

        <Modal isOpen={this.state.isParamConfirmModalOpen}>
          <ModalHeader toggle={() => this.toggleParamConfirmModal('', '')}> Remove param </ModalHeader>
          <ModalBody>
            <div> The param selected will be removed. Do you want to continue?</div>
            <Button color="danger" onClick={() => this.removeSetting()}>
              Remove
            </Button>
          </ModalBody>
        </Modal>
      </div>
    )
  }

  public renderSettings() {
    return this.state.systemSettings.map((set) => this.renderSetting(set))
  }

  public render() {
    return (
      <>
        <Navbar color="faded" light={true} expand="md">
          <NavbarToggler className="mr-2" onClick={() => this.setState({ isNavOpen: !this.state.isNavOpen })} />
          <Collapse isOpen={this.state.isNavOpen} navbar={true}>
            <TopNavLinks />
            <Nav className="ml-auto" navbar={true}>
              <Login />
              <div id="settings-btn">{this.buildSettingsPanelBtn()}</div>
            </Nav>
          </Collapse>
        </Navbar>

        <div className="settings-content">
          {this.renderSettings()}

          {this.props.auth.authenticated && isAdministrator(this.props.auth) ? (
            <Button className="setting-btn-domain" color="info" onClick={this.toggleNewDomainSettingModal}>
              Add new setting domain
            </Button>
          ) : (
            <></>
          )}
        </div>
      </>
    )
  }

  public buildSettingsPanelBtn() {
    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      return (
        <Link className="navbar-link" to="/settings/panel">
          <i title="Settings Panel" className="fas fa-cogs fa-sm" />
        </Link>
      )
    }
    return <></>
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

export default connect(mapStateToProps, actionCreators)(Settings)
