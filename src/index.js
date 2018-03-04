import React from 'react';
import { render } from 'react-dom';
import Repos from './Repos';
import GithubStore from './store';
import './App.css'

const githubStore = new GithubStore();
const App = () => (
    <Repos store={githubStore}/>
);

render(<App/>, document.getElementById('root'));
