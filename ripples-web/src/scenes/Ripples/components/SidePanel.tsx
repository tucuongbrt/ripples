import Parser from 'html-react-parser'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Card from 'reactstrap/lib/Card'
import CardBody from 'reactstrap/lib/CardBody'
import CardTitle from 'reactstrap/lib/CardTitle'
import IAsset from '../../../model/IAsset'
import IRipplesState from '../../../model/IRipplesState'
import { toggleVehicleModal } from '../../../redux/ripples.actions'

interface PropsType {
  title: string
  content: Map<string, string>
  visibility: boolean
  authenticated: boolean
  selectedVehicle?: IAsset
  onSettingsClick: () => void
}

class SidePanel extends Component<PropsType, {}> {
  public buildContent(content: any) {
    const items: JSX.Element[] = []
    for (const key in content) {
      items.push(
        <li key={key}>
          {key}: {Parser(content[key])}
        </li>
      )
    }
    return <ul>{items}</ul>
  }

  public render() {
    if (this.props.visibility) {
      const content = this.buildContent(this.props.content)
      return (
        <>
          <Card className="side-panel">
            <CardBody className="scrollable">
              <CardTitle>
                <h4 className="mr-auto">{this.props.title}</h4>
                {this.props.authenticated && this.props.selectedVehicle && (
                  <i className="fas fa-cog fa-lg" onClick={this.props.onSettingsClick} />
                )}
              </CardTitle>
              <div>{content}</div>
            </CardBody>
          </Card>
        </>
      )
    }
    return <></>
  }
}

function mapStateToProps(state: IRipplesState) {
  const { sidePanelTitle, sidePanelContent, isSidePanelVisible, auth, editVehicle } = state
  return {
    content: sidePanelContent,
    title: sidePanelTitle,
    visibility: isSidePanelVisible,
    authenticated: auth.authenticated,
    selectedVehicle: editVehicle,
  }
}

const actionCreators = {
  toggleVehicleModal,
}

export default connect(mapStateToProps, actionCreators)(SidePanel)
