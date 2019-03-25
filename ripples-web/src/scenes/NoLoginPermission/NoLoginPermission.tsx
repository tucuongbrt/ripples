import React, { Component } from "react";
import { Button } from "reactstrap";

type propsType = {
  location: {
    state: {
      error: string
    }
  }
}

export default class NoLoginPermission extends Component<propsType, {}> {
    render() {
      return (
          <>
          <h1>No Login Permission</h1>
          <div>{this.props.location.state.error}</div>
          <div>Please contact a system administrator to get an account.</div>
          <Button onClick={() => location.href='/'}>
            Back
          </Button>
          </>
      )
    }
  }