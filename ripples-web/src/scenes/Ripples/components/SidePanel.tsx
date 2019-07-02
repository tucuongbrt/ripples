import React, { Component } from 'react'
import { connect } from 'react-redux'
import Card from 'reactstrap/lib/Card'
import CardBody from 'reactstrap/lib/CardBody'
import CardTitle from 'reactstrap/lib/CardTitle'
import IRipplesState from '../../../model/IRipplesState'

interface PropsType {
  title: string
  content: Map<string, string>
  visibility: boolean
}

class SidePanel extends Component<PropsType, {}> {
  constructor(props: PropsType) {
    super(props)
  }

  public buildContent(content: any) {
    const items: JSX.Element[] = []
    for (const key in content) {
      items.push(
        <li key={key}>
          {key}: {content[key]}
        </li>
      )
    }
    return <ul>{items}</ul>
  }

  public render() {
    if (this.props.visibility) {
      const content = this.buildContent(this.props.content)
      return (
        <Card className="side-panel">
          <CardBody className="scrollable">
            <CardTitle>
              <h4>{this.props.title}</h4>
            </CardTitle>
            <div>{content}</div>
          </CardBody>
        </Card>
      )
    }
    return <></>
  }
}

function mapStateToProps(state: IRipplesState) {
  const { sidePanelTitle, sidePanelContent, isSidePanelVisible } = state
  return {
    content: sidePanelContent,
    title: sidePanelTitle,
    visibility: isSidePanelVisible,
  }
}

export default connect(
  mapStateToProps,
  null
)(SidePanel)
