import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Collapse,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  Navbar,
  NavbarToggler,
  Table,
  UncontrolledDropdown,
} from 'reactstrap'
import IAuthState, { isAdministrator, isCasual, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import SettingsService from '../../services/SettingsUtils'
import { fetchDomainNames } from '../../services/DomainUtils'
import TopNavLinks from '../../components/TopNavLinks'
import Login from '../../components/Login'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import ZerotierService from '../../services/ZerotierUtils'
import { createApiKey, fetchApiKeys, removeApiKey } from '../../services/ApiKeyUtils'
import DateService from '../../services/DateUtils'
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
  nodeId: string
  isZtModalOpen: boolean
  ztCmd: string
  isTokenModalOpen: boolean
  isNewTokenVisible: boolean
  isRemoveTokenModalOpen: boolean
  apiKeys: IApiKeys[]
  isNewTokenModalOpen: boolean
  tokenGenerated: string
  tokenToRemove: string
  permissions: string[]
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

interface IApiKeys {
  token: string
  email: string
  domain: string[]
  permission: string[]
  expirationDate: number
}

export class Settings extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0
  private settingsService: SettingsService = new SettingsService()
  private ztService: ZerotierService = new ZerotierService()

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: true,
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
      nodeId: '',
      isZtModalOpen: false,
      ztCmd: '',
      isTokenModalOpen: false,
      isNewTokenVisible: false,
      apiKeys: [],
      isNewTokenModalOpen: false,
      isRemoveTokenModalOpen: false,
      tokenGenerated: '',
      tokenToRemove: '',
      permissions: ['read', 'write'],
    }
    this.fetchSettings = this.fetchSettings.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.toggleSettingModal = this.toggleSettingModal.bind(this)
    this.toggleNewDomainSettingModal = this.toggleNewDomainSettingModal.bind(this)
    this.fetchApiKeys = this.fetchApiKeys.bind(this)
    this.toogleTokenModal = this.toogleTokenModal.bind(this)
    this.toogleNewTokenModal = this.toogleNewTokenModal.bind(this)
    this.generateToken = this.generateToken.bind(this)
    this.removeToken = this.removeToken.bind(this)
    this.onNodeIdSubmission = this.onNodeIdSubmission.bind(this)
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
      this.fetchApiKeys()
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

  public async updateSetting(settingId: any, settingParamName: string) {
    const newSettingValue = this.state.settingInputValue

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
                <input
                  type="text"
                  className="setting-input"
                  id={'setting-' + setting.id + '-' + index}
                  value={this.state.settingInputValue}
                  onChange={(event) => this.setState({ settingInputValue: event.target.value })}
                  disabled={false}
                />
                <i
                  className="fas fa-check"
                  title="Update params"
                  onClick={() => this.updateSetting(setting.id, set[0])}
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

                <input
                  id={'setting-' + setting.id + '-' + index}
                  className="setting-input"
                  type="text"
                  disabled={true}
                  value={set[1] === '""' ? '' : set[1]}
                />
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
                    onClick={
                      (event) =>
                        this.toggleParamConfirmModal(setting.id, set[0]) /*this.removeSetting(setting.id, set[0])*/
                    }
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
              {this.props.auth.authenticated ? (
                <Link className="navbar-link" to="/user/manager">
                  <i title="Users Manager" className="fas fa-users fa-lg" />
                </Link>
              ) : (
                <></>
              )}

              {this.props.auth.authenticated && !isCasual(this.props.auth) && this.buildTokenSelector()}
              {this.props.auth.authenticated && !isCasual(this.props.auth) && this.buildZerotierSelector()}

              <Login />
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

  public buildZerotierSelector() {
    return (
      <>
        <UncontrolledDropdown id="tooltip-zt" nav={true} className="mr-4 active">
          <DropdownToggle nav={true} caret={false}>
            <i className={'fas fa-network-wired fa-lg'} title="Join Ripples Zerotier Network" />
          </DropdownToggle>
          <DropdownMenu right={true} className={'zt-dialog'}>
            <InputGroup>
              <Input
                name="node_address"
                placeholder="Node address"
                onChange={(evt) => this.setState({ nodeId: evt.target.value })}
                value={this.state.nodeId}
                type="text"
                required={true}
              />
            </InputGroup>
            <Button onClick={this.onNodeIdSubmission}>Add node</Button>
          </DropdownMenu>
        </UncontrolledDropdown>
        {this.buildZerotierModal()}
      </>
    )
  }

  public buildZerotierModal() {
    const { ztCmd } = this.state
    return (
      <Modal key={'zt_modal'} isOpen={this.state.isZtModalOpen} toggle={this.toggleZtModal}>
        <ModalHeader toggle={this.toggleZtModal}>Connect to the Ripples ZeroTier network</ModalHeader>
        <ModalBody>
          <code>$ {ztCmd}</code>
        </ModalBody>
        <ModalFooter>
          <CopyToClipboard text={ztCmd} onCopy={() => this.onCmdCopy()}>
            <Button color="primary">Copy command</Button>
          </CopyToClipboard>
          <Button color="secondary" onClick={this.toggleZtModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  public async onNodeIdSubmission() {
    const { nodeId } = this.state
    if (nodeId === '' || nodeId.length !== 10) {
      NotificationManager.error('Please insert a valid 10-digit ZeroTier node ID!')
      return
    }
    const { status, message } = await this.ztService.joinNetwork(nodeId)
    if (status === 'Success') {
      NotificationManager.success('Node added successfully to the Ripples Zerotier network!')
      this.setState({ isZtModalOpen: true, ztCmd: message })
    } else {
      NotificationManager.error(message)
      this.setState({ isZtModalOpen: false })
    }
    this.setState({ nodeId: '' })
  }

  public toggleZtModal() {
    this.setState({ isZtModalOpen: !this.state.isZtModalOpen })
  }

  public onCmdCopy() {
    NotificationManager.success('Command copied to clipboard!')
    this.toggleZtModal()
  }

  public async fetchApiKeys() {
    let email = this.props.auth.currentUser.email
    if (isAdministrator(this.props.auth)) {
      email = 'all'
    }
    const apiKeys: any = await fetchApiKeys(email)
    // const apiKeys: any = await fetchApiKeys()
    this.setState({ apiKeys })
  }

  public buildTokenSelector() {
    return (
      <>
        <i className={'fas fa-key fa-lg'} title="Generate API key" onClick={this.toogleTokenModal} />
        {this.buildTokenModal()}
        {this.buildNewTokenModal()}
        {this.buildRemoveTokenModal()}
      </>
    )
  }

  public buildTokenModal() {
    return (
      <Modal isOpen={this.state.isTokenModalOpen} toggle={this.toogleTokenModal} id={'tokenModal'}>
        <ModalHeader toggle={this.toogleTokenModal}> API keys </ModalHeader>
        <ModalBody>
          <Table id="token-table" responsive={true} striped={true}>
            <thead>
              <tr>
                <th>Expiration date</th>
                <th>API key</th>
                <th>Domain</th>
                <th>Permission</th>
                <th>User</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {this.state.apiKeys.map((apiKey, index) => {
                return (
                  <tr key={index}>
                    <td>{DateService.timestampToReadableDateOnly(apiKey.expirationDate)}</td>
                    <td>
                      {apiKey.token}
                      <CopyToClipboard text={apiKey.token} onCopy={() => this.onTokenCopy()}>
                        <i className="fas fa-copy fa-lg" />
                      </CopyToClipboard>
                    </td>

                    <td>
                      {this.state.domains.map((d, indexDomain) => {
                        return (
                          <label key={indexDomain}>
                            <input
                              type="checkbox"
                              className={'optDomain-' + indexDomain}
                              value={d}
                              checked={apiKey.domain.includes(d) ? true : false}
                              disabled={true}
                            />
                            {d}
                          </label>
                        )
                      })}
                    </td>

                    <td>
                      {this.state.permissions.map((p, indexPermission) => {
                        return (
                          <label key={indexPermission}>
                            <input
                              type="checkbox"
                              className={'optPermission-' + indexPermission}
                              value={p}
                              checked={apiKey.permission.includes(p) ? true : false}
                              disabled={true}
                            />
                            {p}
                          </label>
                        )
                      })}
                    </td>

                    <td>{apiKey.email}</td>

                    <td>
                      {isAdministrator(this.props.auth) ? (
                        <i
                          className="fas fa-trash"
                          title="Remove API Key"
                          onClick={(event) => this.toogleRemoveModalModal(apiKey.token)}
                        />
                      ) : (
                        <></>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          {this.state.isNewTokenVisible ? (
            <>
              <hr />

              <h5 className="token-title">API key settings:</h5>

              <div className="token-email-input">
                <span>Email:</span>
                <input type="text" id={'new-token-email'} />
              </div>

              <div className="token-domain-input">
                <span>Domain:</span>
                {this.state.domains.map((d, indexDomain) => {
                  return (
                    <label key={indexDomain}>
                      <input type="checkbox" className={'new-token-domain'} value={d} />
                      {d}
                    </label>
                  )
                })}
              </div>

              <div className="token-permission-input">
                <span>Permissions:</span>
                {this.state.permissions.map((p, indexPermission) => {
                  return (
                    <label key={indexPermission}>
                      <input type="checkbox" className={'new-token-permission'} value={p} />
                      {p}
                    </label>
                  )
                })}
              </div>

              <Button color="success" className="new-token-btn" onClick={() => this.generateToken()}>
                Generate key
              </Button>
              <Button
                color="secondary"
                className="new-token-btn"
                onClick={() => this.setState({ isNewTokenVisible: !this.state.isNewTokenVisible })}
              >
                Cancel
              </Button>
            </>
          ) : isAdministrator(this.props.auth) ? (
            <Button
              color="secondary"
              onClick={() => this.setState({ isNewTokenVisible: !this.state.isNewTokenVisible })}
            >
              Generate API key
            </Button>
          ) : (
            <></>
          )}
        </ModalBody>
      </Modal>
    )
  }

  public buildNewTokenModal() {
    return (
      <Modal isOpen={this.state.isNewTokenModalOpen} toggle={this.toogleNewTokenModal}>
        <ModalHeader toggle={this.toogleNewTokenModal}> Generated API key </ModalHeader>
        <ModalBody>
          {this.state.tokenGenerated}
          <CopyToClipboard text={this.state.tokenGenerated} onCopy={() => this.onNewTokenCopy()}>
            <i className="fas fa-copy fa-lg" />
          </CopyToClipboard>
        </ModalBody>
      </Modal>
    )
  }

  public buildRemoveTokenModal() {
    return (
      <Modal isOpen={this.state.isRemoveTokenModalOpen}>
        <ModalHeader toggle={() => this.toogleRemoveModalModal('')}> Remove API key </ModalHeader>
        <ModalBody>
          <div> The API key will be removed. Do you want to continue?</div>
          <Button color="danger" onClick={() => this.removeToken()}>
            Remove
          </Button>
        </ModalBody>
      </Modal>
    )
  }

  public toogleTokenModal() {
    this.setState({ isTokenModalOpen: !this.state.isTokenModalOpen })
  }

  public toogleNewTokenModal() {
    this.setState({
      isNewTokenModalOpen: !this.state.isNewTokenModalOpen,
      tokenGenerated: '',
    })
  }

  public toogleRemoveModalModal(token: string) {
    this.setState({
      isRemoveTokenModalOpen: !this.state.isRemoveTokenModalOpen,
      tokenToRemove: token,
    })
  }

  public onTokenCopy() {
    NotificationManager.success('API key copied to clipboard!')
    this.toogleTokenModal()
  }

  public onNewTokenCopy() {
    NotificationManager.success('API key copied to clipboard!')
    this.toogleNewTokenModal()
  }

  public async generateToken() {
    const domains: any = document.getElementsByClassName('new-token-domain')
    const domainSelected: any = []
    for (const domain of domains) {
      if (domain.checked) domainSelected.push(domain.value)
    }

    const permissions: any = document.getElementsByClassName('new-token-permission')
    const permissionSelected: any = []
    for (const permission of permissions) {
      if (permission.checked) permissionSelected.push(permission.value)
    }

    const emailField: any = document.getElementById('new-token-email')
    const emailSelected: string = emailField.value.trim()

    if (domainSelected.length === 0 || permissionSelected.length === 0 || emailSelected.length === 0) {
      NotificationManager.warning('Fields cannot be empty')
    } else {
      // GERAR TOKEN
      const resp = await createApiKey(emailSelected, domainSelected, permissionSelected)
      if (resp.status === 'Success') {
        const respMessage = resp.message.substring(0, resp.message.indexOf(':'))
        const respToken = resp.message.substring(resp.message.indexOf(':') + 1)

        this.setState({
          isNewTokenVisible: !this.state.isNewTokenVisible,
          tokenGenerated: respToken,
          isNewTokenModalOpen: !this.state.isNewTokenModalOpen,
        })
        NotificationManager.success(respMessage)
        this.fetchApiKeys()
      } else {
        NotificationManager.warning(resp.message)
      }
    }
  }

  public async removeToken() {
    const resp = await removeApiKey(this.state.tokenToRemove)
    if (resp.status === 'Success') {
      this.setState({
        isRemoveTokenModalOpen: !this.state.isRemoveTokenModalOpen,
        tokenToRemove: '',
      })
      NotificationManager.success(resp.message)
      this.fetchApiKeys()
    } else {
      NotificationManager.warning(resp.message)
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

export default connect(mapStateToProps, actionCreators)(Settings)
