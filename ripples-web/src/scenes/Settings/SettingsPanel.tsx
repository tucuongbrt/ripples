import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Col,
  Collapse,
  Container,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  Navbar,
  NavbarToggler,
  Row,
  Table,
} from 'reactstrap'
import IAuthState, { isAdministrator, isCasual, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import SettingsService from '../../services/SettingsUtils'
import { createDomain, deleteDomain, fetchDomainNames, updateDomain } from '../../services/DomainUtils'
import TopNavLinks from '../../components/TopNavLinks'
import Login from '../../components/Login'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import ZerotierService from '../../services/ZerotierUtils'
import { createApiKey, fetchApiKeys, removeApiKey } from '../../services/ApiKeyUtils'
import DateService from '../../services/DateUtils'
import 'react-datepicker/dist/react-datepicker.css'
const { NotificationManager } = require('react-notifications')

interface StateType {
  isNavOpen: boolean
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
  isZtSelectorOpen: boolean
  ztCmd: string
  isTokenModalOpen: boolean
  isDomainModalOpen: boolean
  isNewTokenVisible: boolean
  isRemoveTokenModalOpen: boolean
  apiKeys: IApiKeys[]
  isNewTokenModalOpen: boolean
  tokenGenerated: string
  tokenToRemove: string
  permissions: string[]
  domainInputElem: any | null
  domainInputValue: string
  domainPreviousValue: string
  domainNewInput: string
  domainNewInputVisible: boolean
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

interface IApiKeys {
  token: string
  email: string
  domain: string[]
  permission: string[]
  expirationDate: number
}

export class SettingsPanel extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0
  private settingsService: SettingsService = new SettingsService()
  private ztService: ZerotierService = new ZerotierService()

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: true,
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
      isZtSelectorOpen: false,
      ztCmd: '',
      isTokenModalOpen: false,
      isDomainModalOpen: false,
      isNewTokenVisible: false,
      apiKeys: [],
      isNewTokenModalOpen: false,
      isRemoveTokenModalOpen: false,
      tokenGenerated: '',
      tokenToRemove: '',
      permissions: ['read', 'write'],
      domainInputElem: null,
      domainInputValue: '',
      domainPreviousValue: '',
      domainNewInput: '',
      domainNewInputVisible: false,
    }
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.fetchApiKeys = this.fetchApiKeys.bind(this)
    this.toogleTokenModal = this.toogleTokenModal.bind(this)
    this.toogleNewTokenModal = this.toogleNewTokenModal.bind(this)
    this.generateToken = this.generateToken.bind(this)
    this.removeToken = this.removeToken.bind(this)
    this.toggleZtModal = this.toggleZtModal.bind(this)
    this.toggleZtSelector = this.toggleZtSelector.bind(this)
    this.onNodeIdSubmission = this.onNodeIdSubmission.bind(this)
    this.redirectToUserProfilePage = this.redirectToUserProfilePage.bind(this)
    this.toggleDomainModal = this.toggleDomainModal.bind(this)
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
      // NotificationManager.error('Only available for administrators')
    } else {
      this.getDomains()
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

  public render() {
    return (
      <>
        <Navbar color="faded" light={true} expand="md">
          <NavbarToggler className="mr-2" onClick={() => this.setState({ isNavOpen: !this.state.isNavOpen })} />
          <Collapse isOpen={this.state.isNavOpen} navbar={true}>
            <TopNavLinks />
            <Nav className="ml-auto" navbar={true}>
              {this.props.auth.authenticated && this.buildUserProfilePage()}
              {/*this.props.auth.authenticated && !isCasual(this.props.auth) && this.buildTokenSelector()*/}
              {this.props.auth.authenticated && !isCasual(this.props.auth) && this.buildZerotierSelector()}

              <Login />
            </Nav>
          </Collapse>
        </Navbar>

        <div className="settings-panel-content">
          <Container fluid={true}>
            {this.props.auth.authenticated && !isCasual(this.props.auth) && (
              <>
                <Row className="justify-content-center">
                  <Col className="setting-col">{this.redirectToSoiRiskAnalysisPage()}</Col>
                  <Col className="setting-col">{this.redirectToTextMessagesPage()}</Col>
                  <Col className="setting-col">{this.redirectToKmlManagerPage()}</Col>
                </Row>

                <Row className="justify-content-center">
                  <Col className="setting-col">{this.buildTokenSelector()}</Col>
                  <Col className="setting-col">{this.buildZerotier()}</Col>
                </Row>
              </>
            )}

            {this.props.auth.authenticated && isAdministrator(this.props.auth) && (
              <Row className="justify-content-center">
                <Col className="setting-col">{this.redirectToUsersManagerPage()}</Col>
                <Col className="setting-col">{this.buildDomainEditor()}</Col>
                <Col className="setting-col">{this.redirectToSettingsPage()}</Col>
              </Row>
            )}
          </Container>
        </div>
      </>
    )
  }

  public buildZerotier() {
    return (
      <>
        <i
          className={'fas fa-network-wired fa-4x '}
          title="Join Ripples Zerotier Network"
          onClick={this.toggleZtSelector}
        />
        <p className="settings-panel-info-domain">Zerotier Network</p>
        {this.buildZerotierSelector()}
        {this.buildZerotierModal()}
      </>
    )
  }

  public buildZerotierSelector() {
    return (
      <Modal isOpen={this.state.isZtSelectorOpen} toggle={this.toggleZtSelector}>
        <ModalHeader toggle={this.toggleZtSelector}> Zerotier Network </ModalHeader>
        <ModalBody>
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
          <div className="btn-zt-modal">
            <Button color="primary" onClick={this.onNodeIdSubmission}>
              Add node
            </Button>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  /*
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
    */

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
      this.setState({ isZtModalOpen: true, ztCmd: message, isZtSelectorOpen: !this.state.isZtSelectorOpen })
    } else {
      NotificationManager.error(message)
      this.setState({ isZtModalOpen: false })
    }
    this.setState({ nodeId: '' })
  }

  public toggleZtModal() {
    this.setState({ isZtModalOpen: !this.state.isZtModalOpen })
  }

  public toggleZtSelector() {
    this.setState({ isZtSelectorOpen: !this.state.isZtSelectorOpen })
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
        <i className={'fas fa-key fa-4x'} title="Generate API key" onClick={this.toogleTokenModal} />
        <p className="settings-panel-info-key">Generate API key</p>
        {this.buildTokenModal()}
        {this.buildNewTokenModal()}
        {this.buildRemoveTokenModal()}
      </>
    )
  }

  public buildDomainEditor() {
    return (
      <>
        <i className={'fas fa-user-cog fa-4x '} title="Edit Domains" onClick={this.toggleDomainModal} />
        <p className="settings-panel-info-domain">Edit Domains</p>
        {this.buildDomainModal()}
      </>
    )
  }

  public buildDomainModal() {
    return (
      <Modal isOpen={this.state.isDomainModalOpen} toggle={this.toggleDomainModal}>
        <ModalHeader toggle={this.toggleDomainModal}> Edit domain </ModalHeader>
        <ModalBody>
          {this.state.domains.map((d, index) => {
            return this.state.domainInputElem && this.state.domainInputElem.id === 'domain-' + index ? (
              <div key={index} className="domainRow" domain-input={'domain-' + index}>
                <input
                  type="text"
                  className="domain-input"
                  id={'domain-' + index}
                  value={this.state.domainInputValue}
                  onChange={(event) => this.setState({ domainInputValue: event.target.value })}
                  disabled={false}
                />
                <i className="fas fa-check" title="Update domain" onClick={() => this.updateDomainName()} />
              </div>
            ) : (
              <div key={index} className="domainRow" domain-input={'domain-' + index}>
                <input type="text" className="domain-input" id={'domain-' + index} value={d} disabled={true} />
                <i
                  className="fas fa-pencil-alt"
                  title="Edit domain"
                  onClick={(event) => this.enableInputDomain(event)}
                />
                <i className="fas fa-trash" title="Remove domain" onClick={(event) => this.removeDomain(event)} />
              </div>
            )
          })}
          {this.state.domainNewInputVisible ? (
            <div>
              <input
                type="text"
                className="domain-input"
                id={'domain-new-input'}
                placeholder="Domain name"
                value={this.state.domainNewInput}
                onChange={(event) => this.setState({ domainNewInput: event.target.value })}
              />
              <div className="btn-domain-modal">
                <Button color="success" onClick={() => this.createDomain()}>
                  Add
                </Button>
                <Button color="secondary" onClick={() => this.setState({ domainNewInputVisible: false })}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="btn-domain-modal">
              <Button
                color="primary"
                onClick={() => this.setState({ domainNewInputVisible: !this.state.domainNewInputVisible })}
              >
                New domain
              </Button>
            </div>
          )}
        </ModalBody>
      </Modal>
    )
  }

  public async createDomain() {
    const domainName = this.state.domainNewInput

    const response = await createDomain(domainName)
    if (response.status === 'Success') {
      this.toggleDomainModal()
      this.setState({
        domainNewInput: '',
        domainNewInputVisible: false,
      })
      this.getDomains()
      NotificationManager.success('Created domain')
    } else {
      NotificationManager.warning('Cannot create domain')
    }
  }

  public async removeDomain(event: any) {
    const elem = event.target
    const domainInputId = elem.parentElement.getAttribute('domain-input')
    const inputElem: any = document.getElementById(domainInputId)

    const response = await deleteDomain(inputElem.value)
    if (response.status === 'Success') {
      this.getDomains()
      NotificationManager.success('Domain removed')
    } else {
      NotificationManager.warning('Cannot remove domain')
    }
  }

  public async updateDomainName() {
    const previousDomainName = this.state.domainPreviousValue
    const newDomainName = this.state.domainInputValue

    const response = await updateDomain(previousDomainName, newDomainName)
    if (response.status === 'Success') {
      this.toggleDomainModal()
      this.setState({
        domainInputElem: null,
        domainInputValue: '',
        domainPreviousValue: '',
      })
      /*
                  const users = [...this.state.users]
                  users.forEach((u) => {
                    const updateDomain: string[] = u.domain
                    const index = updateDomain.indexOf(previousDomainName)
                    if (index !== -1) {
                      updateDomain[index] = newDomainName
                    }
                    u.domain = updateDomain
                  })
                  this.setState({ users })
            */
      this.getDomains()

      NotificationManager.success('Updated domain name')
    } else {
      NotificationManager.warning('Cannot update domain name')
    }
  }

  public enableInputDomain(event: any) {
    const elem = event.target
    const domainInputId = elem.parentElement.getAttribute('domain-input')
    const inputElem: any = document.getElementById(domainInputId)

    if (inputElem != null) {
      this.setState({
        domainInputElem: inputElem,
        domainInputValue: inputElem.value,
        domainPreviousValue: inputElem.value,
      })
    } else {
      this.setState({
        domainInputElem: null,
        domainInputValue: '',
        domainPreviousValue: '',
      })
    }
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
                      {this.props.auth.authenticated ? (
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
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => this.removeToken()}>
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  public toogleTokenModal() {
    this.setState({ isTokenModalOpen: !this.state.isTokenModalOpen })
  }

  public toggleDomainModal() {
    this.setState({ isDomainModalOpen: !this.state.isDomainModalOpen })
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

  private redirectToUsersManagerPage() {
    return (
      <>
        <Link className="navbar-link-panel" to="/user/manager">
          <i title="Users Manager" className="fas fa-users fa-4x" />
        </Link>
        <p className="settings-panel-info">Users Manager</p>
      </>
    )
  }

  private redirectToSoiRiskAnalysisPage() {
    return (
      <>
        <Link className="navbar-link-panel" to="/soirisk">
          <i title="Soi Risk Analysis" className="fas fa-exclamation-triangle fa-4x" />
        </Link>
        <p className="settings-panel-info">Soi Risk Analysis</p>
      </>
    )
  }

  private redirectToTextMessagesPage() {
    return (
      <>
        <Link className="navbar-link-panel" to="/messages/text">
          <i title="Text Messages" className="fas fa-envelope-open-text fa-4x" />
        </Link>
        <p className="settings-panel-info">Text Messages</p>
      </>
    )
  }

  private redirectToKmlManagerPage() {
    return (
      <>
        <Link className="navbar-link-panel" to="/kml/manager">
          <i title="KML Manager" className="fas fa-map fa-4x" />
        </Link>
        <p className="settings-panel-info">KML Manager</p>
      </>
    )
  }

  private redirectToSettingsPage() {
    return (
      <>
        <Link className="navbar-link-panel" to="/settings/manager">
          <i title="Settings Manager" className="fas fa-cogs fa-4x" />
        </Link>
        <p className="settings-panel-info">Settings Manager</p>
      </>
    )
  }

  private buildUserProfilePage() {
    return (
      <>
        <i title="User Profile" className="fas fa-user fa-lg" onClick={this.redirectToUserProfilePage} />
        <Link id="user-link" to="/user/profile" />
      </>
    )
  }

  private redirectToUserProfilePage() {
    console.log('-> ' + this.props.auth.currentUser.email)
    localStorage.setItem('user-profile', this.props.auth.currentUser.email)
    const userLink = document.getElementById('user-link')
    if (userLink !== null) {
      userLink.click()
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

export default connect(mapStateToProps, actionCreators)(SettingsPanel)
