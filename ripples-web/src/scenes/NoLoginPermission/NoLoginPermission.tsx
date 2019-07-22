import React, { Component } from 'react'
import { Button } from 'reactstrap'

interface PropsType {
  location: {
    state: {
      error: string
    }
  }
}

export default class NoLoginPermission extends Component<PropsType, {}> {
  public render() {
    return (
      <>
        <h1>No Login Permission</h1>
        <div>{this.props.location.state.error}</div>
        <div>Please contact a system administrator to get an account.</div>
        <Button onClick={() => (window.location.href = '/')}>Back</Button>
      </>
    )
  }
}
