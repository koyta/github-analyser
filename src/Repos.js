import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Doughnut } from 'react-chartjs-2'

@observer
export default class Repos extends Component {
  state = {
    keys: [],
    values: [],
    sum: 0,
  }

  colors = [
    '#546de5',
    '#63cdda',
    '#786fa6',
    '#e15f41',
    '#f5cd79',
    '#f78fb3',
    '#e66767',
  ]

  computeData = async () => {
    const sorted = this.props.store.sortedOverallLanguagesValues
    const values = sorted.map(item => {
      return item[1]
    })
    const keys = sorted.map(item => {
      return item[0]
    })
    const sum = this.props.store.languagesSummary
    this.setState({
      keys: keys,
      values: values,
      sum: sum,
    })
  }

  async componentDidMount () {
    await this.props.store.fetchUserInfo('/users/koyta/repos')
    await this.computeData()
  }

  render () {
    return (
      <section>
        <div>
          {this.state.keys.map((key, i) => {
            return <span key={i} style={{
              width: `${this.state.values[i] / this.state.sum * 100}%`,
            }}>{key}</span>
          })}
        </div>
        <div>
          {
            this.state.values.map((value, i) => {
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
