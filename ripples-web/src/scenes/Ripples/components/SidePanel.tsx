import React, { Component } from "react";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";
import CardTitle from "reactstrap/lib/CardTitle";
import CardText from "reactstrap/lib/CardText";
import IRipplesState from "../../../model/IRipplesState";
import { connect } from "react-redux";

type propsType = {
    title: string
}

class SidePanel extends Component<propsType, {}> {

    constructor(props: propsType) {
        super(props);
    }

    render() {
        return (
            <Card className="side-panel">
                <CardBody>
                    <CardTitle>{this.props.title}</CardTitle>
                    <CardText>Random text</CardText>
                </CardBody>
            </Card>
        )
    }
}

function mapStateToProps(state: IRipplesState) {
    const { sidePanelTitle } = state
    return {
        title: sidePanelTitle,
    }
}

export default connect(mapStateToProps, null)(SidePanel)