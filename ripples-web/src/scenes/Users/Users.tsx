import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Modal, ModalBody, ModalHeader, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { fetchUsers, getCurrentUser, updateUserDomain, updateUserRole } from '../../services/UserUtils'
import { createDomain, deleteDomain, fetchDomainNames, updateDomain } from '../../services/DomainUtils'
const { NotificationManager } = require('react-notifications')

interface StateType {
  isNavOpen: boolean
  loading: boolean
  users: {
    id: number
    name: string
    email: string
    role: string
    verified: boolean
    domain: string[]
  }[]
  isDomainModalOpen: boolean
  domains: string[]
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

export class Users extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: true,
      loading: true,
      users: [],
      isDomainModalOpen: false,
      domains: [],
      domainInputElem: null,
      domainInputValue: '',
      domainPreviousValue: '',
      domainNewInput: '',
      domainNewInputVisible: false,
    }
    this.getUsers = this.getUsers.bind(this)
    this.handleChangeRole = this.handleChangeRole.bind(this)
    this.handleChangeDomain = this.handleChangeDomain.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
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

  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
    this.setState({ loading: false })
    if (!(this.props.auth.authenticated && isAdministrator(this.props.auth))) {
      NotificationManager.error('Only available for administrators')
    } else {
      this.getUsers()
      this.timerID = window.setInterval(this.getUsers, 60000)
      this.getDomains()
    }
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  private handleChangeRole(event: any) {
    const elem = event.target
    const value = elem.value
    const userDataId = elem.parentElement.getAttribute('user-data')

    const users = [...this.state.users]
    const item = {
      ...users[userDataId],
      role: value,
    }

    updateUserRole(users[userDataId].email, value).then((res) => {
      if (res.status === 'Success') {
        users[userDataId] = item
        this.setState({ users })
        NotificationManager.success('User role updated')
      } else {
        NotificationManager.error('Cannot update user role')
      }
    })
  }

  private handleChangeDomain(event: any) {
    const userDomainId = event.target.closest('td').getAttribute('user-domain')

    const domains: any = document.getElementsByClassName('optDomain-' + userDomainId)
    const domainSelected: any = []
    for (const domain of domains) {
      if (domain.checked) domainSelected.push(domain.value)
    }

    const users = [...this.state.users]
    const item = {
      ...users[userDomainId],
      domain: domainSelected,
    }

    updateUserDomain(users[userDomainId].email, domainSelected).then((res) => {
      if (res.status === 'Success') {
        users[userDomainId] = item
        this.setState({ users })
        NotificationManager.success('User domain updated')
      } else {
        NotificationManager.error('Cannot update user domain')
      }
    })
  }

  public toggleDomainModal() {
    this.setState({
      isDomainModalOpen: !this.state.isDomainModalOpen,
    })
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

      this.getDomains()

      NotificationManager.success('Updated domain name')
    } else {
      NotificationManager.warning('Cannot update domain name')
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

  public async getDomains() {
    const domains: string[] = await fetchDomainNames()
    this.setState({ domains })
  }

  public getUsers() {
    fetchUsers()
      .then((data) => {
        const users = data.map((m: any) =>
          Object.assign({}, m, {
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            verified: m.emailVerified,
          })
        )
        // this.setState({ users: users.reverse() })
        this.setState({ users })
      })
      .catch((_) => {
        NotificationManager.warning('Failed to fetch users')
      })
  }

  public renderUser(
    user: { id: number; name: string; email: string; role: string; verified: boolean; domain: string[] },
    index: number
  ) {
    const domain: string[] = []
    user.domain.forEach((d) => {
      domain.push(d)
    })

    return (
      <tr key={index}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td user-data={index}>
          <select className="input-roles" value={user.role} onChange={this.handleChangeRole}>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="SCIENTIST">Scientist</option>
            <option value="OPERATOR">Operator</option>
            <option value="CASUAL">Casual</option>
          </select>
        </td>
        <td user-domain={index}>
          <div className="input-domain">
            {this.state.domains.map((d, indexOpt) => {
              return (
                <label key={indexOpt}>
                  <input
                    type="checkbox"
                    className={'optDomain-' + index}
                    value={d}
                    checked={domain.includes(d) ? true : false}
                    onChange={this.handleChangeDomain}
                  />
                  {d}
                </label>
              )
            })}
          </div>
        </td>
      </tr>
    )
  }

  public renderUsers() {
    return this.state.users.map((user, index) => this.renderUser(user, index))
  }

  public render() {
    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      return (
        <>
          <SimpleNavbar />
          <div>
            <Table id="users-table" responsive={true} striped={true}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>
                    Domain <i className="fas fa-cog fa-lg" onClick={this.toggleDomainModal} />{' '}
                  </th>
                </tr>
              </thead>
              <tbody>{this.renderUsers()}</tbody>
            </Table>

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
          </div>
        </>
      )
    } else {
      return (
        <>
          <SimpleNavbar />
          <div>
            <Table id="users-table" responsive={true} striped={true}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Domain</th>
                </tr>
              </thead>
            </Table>
          </div>
        </>
      )
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

export default connect(mapStateToProps, actionCreators)(Users)
