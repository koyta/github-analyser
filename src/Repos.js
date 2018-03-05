import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Doughnut } from 'react-chartjs-2'

@observer
export default class Repos extends Component {
  state = {
    keys: [],
    values: [],
    entries: [],
    sum: 0,
    user: ''
  }

  colors = [
    '#786fa6',
    '#546de5',
    '#63cdda',
    '#f78fb3',
    '#e66767',
    '#e15f41',
    '#f5cd79',
  ]

  computeData = async () => {
    const sorted = this.props.store.sortedOverallLanguagesValues
    const sortedValues = sorted.map(item => {
      return item[1]
    })
    const sortedKeys = sorted.map(item => {
      return item[0]
    })
    const sum = this.props.store.languagesSummary
    this.setState({
      keys: sortedKeys,
      values: sortedValues,
      sum: sum,
    })
  }

  onUsernameChange = (e) => {
    e.preventDefault()
    this.setState({
      user: e.currentTarget.value
    })
  }

  onSearchClick = async (e) => {
    e.preventDefault()
    await this.props.store.fetchUserReposInfo(this.state.user)
    await this.computeData()
    await this.props.store.fetchUserInfo(this.state.user)
  }

  render () {
    return (
      <section>
        <div className="centered-block">
          <input type="text" value={this.state.user} onChange={(e) => this.onUsernameChange(e)} placeholder={'username'}/>
          <button onClick={(e) => this.onSearchClick(e)}>Fetch</button>
          <a href={this.props.store.userLink}>{this.props.store.userLink}</a>
          <p>Stars: {this.props.store.starredRepos}</p>
        </div>
        <div className="langs">
          {this.state.keys.filter((key) => {
            return this.state.values.map(value => {
              return value/this.state.sum*100 > 5
            })
          }).map((key, i) => {
            return <span key={i} style={{
              width: `${this.state.values[i] / this.state.sum * 100}%`,
            }}>{key}&nbsp;{(this.state.values[i] / this.state.sum * 100).toFixed(1)}%</span>
          })}
        </div>
        <div className="percent">
          {
            this.state.values.filter(value => {
              return (value/this.state.sum*100) > 5
            }).map((value, i) => {
              return <span key={i} style={{
                width: `${value / this.state.sum * 100}%`,
                background: this.colors[i],
              }}/>
            })
          }
        </div>
        <Doughnut
          data={
            {
              datasets: [
                {
                  data: this.state.values,
                  backgroundColor: this.colors
                }
              ],
              labels: this.state.keys
            }
          }
        />
      </section>
    )
  }
}
