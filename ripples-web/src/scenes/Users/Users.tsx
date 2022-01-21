import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { fetchUsers, getCurrentUser, removeUser, updateUserDomain, updateUserRole } from '../../services/UserUtils'
import { deleteDomain, fetchDomainNames, updateDomain } from '../../services/DomainUtils'
import { Link } from 'react-router-dom'
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
  isUserModalOpen: boolean
  domains: string[]
  domainInputElem: any | null
  domainInputValue: string
  domainPreviousValue: string
  domainNewInput: string
  domainNewInputVisible: boolean
  userToRemove: string
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
      isNavOpen: false,
      loading: true,
      users: [],
      isDomainModalOpen: false,
      isUserModalOpen: false,
      domains: [],
      domainInputElem: null,
      domainInputValue: '',
      domainPreviousValue: '',
      domainNewInput: '',
      domainNewInputVisible: false,
      userToRemove: '',
    }
    this.getUsers = this.getUsers.bind(this)
    this.handleChangeRole = this.handleChangeRole.bind(this)
    this.handleChangeDomain = this.handleChangeDomain.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.toggleUserModal = this.toggleUserModal.bind(this)
    this.handleRemoverUser = this.handleRemoverUser.bind(this)
    this.openUserProfile = this.openUserProfile.bind(this)
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

    if (this.props.auth.authenticated) {
      if (isAdministrator(this.props.auth)) {
        this.getUsers()
        this.timerID = window.setInterval(this.getUsers, 60000)
        this.getDomains()
      } else {
        NotificationManager.error('Only available for administrators')
      }
    } else {
      NotificationManager.error('Please login')
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

  private async handleRemoverUser() {
    const resp = await removeUser(this.state.userToRemove)
    if (resp.status === 'Success') {
      NotificationManager.success(resp.message)
    } else {
      NotificationManager.error(resp.message)
    }
    this.toggleUserModal('')
    this.getUsers()
  }

  private toggleUserModal(userEmail: string, event?: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (event) {
      event.stopPropagation()
    }
    this.setState({
      isUserModalOpen: !this.state.isUserModalOpen,
      userToRemove: userEmail,
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

  public async updateDomainName() {
    const previousDomainName = this.state.domainPreviousValue
    const newDomainName = this.state.domainInputValue

    const response = await updateDomain(previousDomainName, newDomainName)
    if (response.status === 'Success') {
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

  public openUserProfile(email: string) {
    localStorage.setItem('user-profile', email)
    const userLink = document.getElementById('user-link')
    if (userLink !== null) {
      userLink.click()
    }
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
      <tr key={index} onClick={() => this.openUserProfile(user.email)}>
        <td className="user-action">
          <i
            className="fas fa-trash"
            title="Remove user"
            onClick={(event) => this.toggleUserModal(user.email, event)}
          />
        </td>
        <td className="user-name">{user.name}</td>
        <td className="user-email">{user.email}</td>
        <td className="user-role" user-data={index}>
          <select
            className="input-roles"
            value={user.role}
            onChange={this.handleChangeRole}
            onClick={(event) => event.stopPropagation()}
          >
            <option value="ADMINISTRATOR" onClick={(event) => event.stopPropagation()}>
              Administrator
            </option>
            <option value="SCIENTIST" onClick={(event) => event.stopPropagation()}>
              Scientist
            </option>
            <option value="OPERATOR" onClick={(event) => event.stopPropagation()}>
              Operator
            </option>
            <option value="CASUAL" onClick={(event) => event.stopPropagation()}>
              Casual
            </option>
          </select>
        </td>
        <td className="user-domain" user-domain={index}>
          <div className="input-domain">
            {this.state.domains.map((d, indexOpt) => {
              return (
                <label key={indexOpt} onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    className={'optDomain-' + index}
                    value={d}
                    checked={domain.includes(d) ? true : false}
                    onChange={this.handleChangeDomain}
                    onClick={(event) => event.stopPropagation()}
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
          <SimpleNavbar auth={this.props} />
          <div>
            <Table id="users-table" responsive={true} striped={true}>
              <thead>
                <tr>
                  <th className="user-action-header" />
                  <th className="user-name">Name</th>
                  <th className="user-email">Email</th>
                  <th className="user-role">Role</th>
                  <th className="user-domain">Domain</th>
                </tr>
              </thead>
              <tbody>{this.renderUsers()}</tbody>
            </Table>

            <Modal isOpen={this.state.isUserModalOpen} toggle={() => this.toggleUserModal('')}>
              <ModalHeader toggle={() => this.toggleUserModal('')}>Remove user</ModalHeader>
              <ModalBody>
                The user "{this.state.userToRemove}" will be removed permanently. Do you want to continue?
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onClick={() => this.handleRemoverUser()}>
                  Yes
                </Button>
              </ModalFooter>
            </Modal>

            <Link id="user-link" to="/user/profile" />
          </div>
        </>
      )
    } else {
      return (
        <>
          <SimpleNavbar auth={this.props} />
          <div>
            <Table id="users-table" responsive={true} striped={true}>
              <thead>
                <tr>
                  <th className="user-name-nologin">Name</th>
                  <th className="user-email-nologin">Email</th>
                  <th className="user-role-nologin">Role</th>
                  <th className="user-domain-nologin">Domain</th>
                </tr>
              </thead>
            </Table>

            <Link id="user-link" to="/user/profile" />
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
