import React, { Component } from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'

@observer
export default class Repos extends Component {
  state = {
    values: [],
    sum: 0,
  }

  colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'magenta',
    'purple',
    'brown',
  ]

  computeData = () => {
    const langs = this.props.store.overallLanguages
    let temp = []
    for (let lang in langs) {
      if (langs.hasOwnProperty(lang)) { //if (langs have "JavaScript" key)
        temp = [...temp, langs[lang]]
      }
    }
    temp = temp.sort((a, b) => {
      return a < b
    })
    this.setState({
      values: temp,
      sum: this.props.store.languagesSummary,
    })
  }

  async componentDidMount () {
    await this.props.store.fetchUserInfo('/users/koyta/repos')
    this.computeData()
  }

  render () {
    return (
      <div>
        <DevTools/>
        <button onClick={() => this.computeData()}>Click</button>
        <div style={{width: '100%', height: 20}}>
          {
            this.state.values.map((value, i) => {
              return <span key={i} style={{
                display: 'inline-block',
                height: '100%',
                minWidth: `${value / this.state.sum * 100}%`,
                background: this.colors[i],
              }}/>
            })
          }
        </div>
      </div>
    )
  }
}
