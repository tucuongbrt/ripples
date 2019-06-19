import React, { Component } from "react";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";
import CardTitle from "reactstrap/lib/CardTitle";
import CardText from "reactstrap/lib/CardText";
import IRipplesState from "../../../model/IRipplesState";
import { connect } from "react-redux";

type propsType = {
    title: string
    content: Map<string, string>
    visibility: boolean
}

class SidePanel extends Component<propsType, {}> {

    constructor(props: propsType) {
        super(props);
    }

    buildContent(content: any) {
        let items: JSX.Element[] = [];
        for (let key in content) {
            items.push(<li key={key}>{key}: {content[key]}</li>)
        }
        return <ul>{items}</ul>
    }

    render() {
        if (this.props.visibility) {
            const content = this.buildContent(this.props.content)
            return (
                <Card className="side-panel">
                    <CardBody>
                        <CardTitle>{this.props.title}</CardTitle>
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
        title: sidePanelTitle,
        content: sidePanelContent,
        visibility: isSidePanelVisible,
    }
}

export default connect(mapStateToProps, null)(SidePanel)