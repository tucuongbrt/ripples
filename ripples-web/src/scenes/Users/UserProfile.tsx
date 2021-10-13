import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import SimpleNavbar from '../../components/SimpleNavbar'
import IAuthState, { isAdministrator, IUser } from '../../model/IAuthState'
import IRipplesState from '../../model/IRipplesState'
import ITextMessage from '../../model/ITextMessage'
import { setUser } from '../../redux/ripples.actions'
import { fetchUser, getCurrentUser } from '../../services/UserUtils'
const { NotificationManager } = require('react-notifications')

type IUserProfile = {
  id: number
  name: string
  email: string
  role: string
  emailVerified: boolean
  domain: string[]
  imageUrl: string | null
}

interface StateType {
  messages: ITextMessage[]
  isNavOpen: boolean
  userProfile: IUserProfile | null
  isImageModalOpen: boolean
  userImageSelected?: File
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

export class UserProfile extends Component<PropsType, StateType> {
  public notificationSystem: any = null
  public timerID: number = 0

  constructor(props: any) {
    super(props)
    this.state = {
      isNavOpen: true,
      messages: [],
      userProfile: null,
      isImageModalOpen: false,
    }
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.loadUserInfo = this.loadUserInfo.bind(this)
    this.handleUploadImage = this.handleUploadImage.bind(this)
    this.handleImageSelected = this.handleImageSelected.bind(this)
    this.toggleImageModal = this.toggleImageModal.bind(this)
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
    if (this.props.auth.authenticated) {
      const userEmail = localStorage.getItem('user-profile')
      if (isAdministrator(this.props.auth)) {
        this.loadUserInfo()
      } else if (userEmail !== null && userEmail === this.props.auth.currentUser.email) {
        this.loadUserInfo()
      } else {
        NotificationManager.error('Permission required')
      }
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

  public async loadUserInfo() {
    const userEmail = localStorage.getItem('user-profile')
    if (userEmail !== null) {
      const userInfo: IUserProfile = await fetchUser(userEmail)
      this.setState({ userProfile: userInfo })
    }
  }

  private handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0]
      const img = document.getElementById('imgSelected')
      if (img) {
        img.setAttribute('src', URL.createObjectURL(file))
        this.setState({ userImageSelected: file })
      }
    }
  }

  private toggleImageModal() {
    this.setState({
      isImageModalOpen: !this.state.isImageModalOpen,
    })
  }

  public async handleUploadImage() {
    if (this.state.userImageSelected && process.env.REACT_APP_API_BASE_URL) {
      const formData = new FormData()
      formData.append('image', this.state.userImageSelected)
      formData.append('baseUrl', process.env.REACT_APP_API_BASE_URL)
      formData.append('email', this.props.auth.currentUser.email)

      // workaround to upload images
      fetch(process.env.REACT_APP_API_BASE_URL + '/user/image/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          type: 'formData',
        },
        body: formData,
      }).then(
        (res) => {
          if (res.ok) {
            window.location.href = '/user/profile'
          } else if (res.status === 401) {
            NotificationManager.error('Cannot upload image')
          }
        },
        (e) => {
          NotificationManager.error('Cannot upload image')
        }
      )
    }
    this.toggleImageModal()
  }

  public render() {
    return (
      <>
        <SimpleNavbar auth={this.props} />
        <div>
          {this.state.userProfile !== null ? (
            <div className="user-profile">
              <div id="user-profile-left">
                {this.state.userProfile.imageUrl !== null ? (
                  <div className="user-profile-img-wrap">
                    <img src={this.state.userProfile.imageUrl} alt="User" />
                    {this.props.auth.currentUser.email === localStorage.getItem('user-profile') ? (
                      <i className="fas fa-edit" onClick={this.toggleImageModal} />
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div className="user-profile-img-wrap">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User" />
                    {this.props.auth.currentUser.email === localStorage.getItem('user-profile') ? (
                      <i className="fas fa-edit" onClick={this.toggleImageModal} />
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>

              <div id="user-profile-right">
                <p>
                  <span className="user-profile-field">Name: </span>
                  <span className="user-profile-value"> {this.state.userProfile.name} </span>
                </p>
                <p>
                  <span className="user-profile-field">Email: </span>
                  <span className="user-profile-value"> {this.state.userProfile.email} </span>
                </p>
                <p>
                  <span className="user-profile-field">Role: </span>
                  <span className="user-profile-value"> {this.state.userProfile.role} </span>
                </p>
                <p>
                  <span className="user-profile-field">Domain: </span>
                  <span className="user-profile-value">
                    {this.state.userProfile.domain.map((d, index, arr) => {
                      if (arr.length - 1 === index) {
                        return (
                          <span key={'user-profile-value-domain' + index} className="user-profile-value-domain">
                            {d}
                          </span>
                        )
                      } else {
                        return (
                          <span key={'user-profile-value-domain' + index} className="user-profile-value-domain">
                            {d + ','} &nbsp;{' '}
                          </span>
                        )
                      }
                    })}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        <Modal isOpen={this.state.isImageModalOpen} toggle={() => this.toggleImageModal()}>
          <ModalHeader toggle={() => this.toggleImageModal()}>Upload Image</ModalHeader>
          <ModalBody>
            <input
              type="file"
              id="imgInput"
              name="image"
              accept="image/png, image/jpeg"
              onChange={(event) => {
                this.handleImageSelected(event)
              }}
            />
            <img id="imgSelected" src="#" alt="User file" />
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={() => this.handleUploadImage()}>
              Upload
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
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

export default connect(mapStateToProps, actionCreators)(UserProfile)
