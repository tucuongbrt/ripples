import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Home extends Component{
    render(){
        return(
            <div>
                <ul>
                    <li><Link to="/ripples">Ripples</Link></li>
                    <li><Link to="/soirisk">SOI Risk Analysis</Link></li>
                </ul>
            </div>
        )
    }
}