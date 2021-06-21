import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { fetchUsers, getCurrentUser, updateUserDomain, updateUserRole } from '../../services/UserUtils'
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
    }
    this.getUsers = this.getUsers.bind(this)
    this.handleChangeRole = this.handleChangeRole.bind(this)
    this.handleChangeDomain = this.handleChangeDomain.bind(this)
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
    this.setState({ loading: false })
    if (!(this.props.auth.authenticated && isAdministrator(this.props.auth))) {
      NotificationManager.error('Only available for administrators')
    } else {
      this.getUsers()
      this.timerID = window.setInterval(this.getUsers, 60000)
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
            <label>
              <input
                type="checkbox"
                className={'optDomain-' + index}
                value="REP"
                checked={domain.includes('REP') ? true : false}
                onChange={this.handleChangeDomain}
              />
              REP
            </label>
            <label>
              <input
                type="checkbox"
                className={'optDomain-' + index}
                value="Ramp"
                checked={domain.includes('Ramp') ? true : false}
                onChange={this.handleChangeDomain}
              />
              Ramp
            </label>
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
                  <th>Domain</th>
                </tr>
              </thead>
              <tbody>{this.renderUsers()}</tbody>
            </Table>
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
