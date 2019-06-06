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
}

class SidePanel extends Component<propsType, {}> {

    constructor(props: propsType) {
        super(props);
    }

    buildContent(content: Map<string, string>) {
        const items = Array.from(content, ([key, value]) => {
            return <li>{key}: {value}</li>
        })
        return <ul>{items}</ul>
    }

    render() {
        const content = this.buildContent(this.props.content)
        return (
            <Card className="side-panel">
                <CardBody>
                    <CardTitle>{this.props.title}</CardTitle>
                    <CardText>{content}</CardText>
                </CardBody>
            </Card>
        )
    }
}

function mapStateToProps(state: IRipplesState) {
    const { sidePanelTitle, sidePanelContent } = state
    return {
        title: sidePanelTitle,
        content: sidePanelContent,
    }
}

export default connect(mapStateToProps, null)(SidePanel)