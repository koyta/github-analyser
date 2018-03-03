import {
  action,
  computed,
  extendShallowObservable,
  observable,
  useStrict,
} from 'mobx'
import { apiCall } from './utils/apiCall'

useStrict(true)

class GithubStore {

  state = 'done' // pending | done | error

  @observable _repos = []
  @observable _repoLanguages = []
  // @observable _overallLanguages = observable.shallowObject({})
  @observable _overallLanguages = observable.shallowMap({})


  @computed
  get repoLanguages () {
    return this._repoLanguages
  }

  @computed
  get overallLanguages () {
    return this._overallLanguages
  }

  @computed
  get languagesSummary () {
    let temp = []
    for (let lang in this._overallLanguages) {
      if (this._overallLanguages.hasOwnProperty(lang)) { //if (this._overallLanguages have "JavaScript" key)
        console.log(lang)
        temp.push(this._overallLanguages[lang])
      }
    }
    let sum = 0
    temp.forEach((item) => {
      sum += item
    })
    console.log(sum)
    return sum
  }

  @action
  async calcLangsForUser () {
    try {
      this.state = 'pending'
      let langs = this._repos.map(async repo => {
        let response = await apiCall.get(repo.languages_url)
        let data = response.data
        return {
          id: repo.id,
          languages: data,
        }
      })
      this._repoLanguages = await Promise.all(langs)
      this._repoLanguages.forEach(item => {
        let langs = item.languages
        Object.keys(langs).forEach((lang) => {
          if (lang in this._overallLanguages) {
            this._overallLanguages[lang] += langs[lang]
          } else {
            extendShallowObservable(this._overallLanguages, {
              [lang]: langs[lang],
            })
          }
        })
      })
      this.state = 'done'
    } catch (error) {
      console.error(error)
      this.state = 'error'
      throw new Error(error)
    }

  }

  @action('Скачиваем данные с гитхаба')
  async fetchUserInfo (url) {
    try {
      this.state = 'pending'
      let response = await apiCall.get(url)
      this._repos = await response.data
      await this.calcLangsForUser()
      this.state = 'done'
    } catch (error) {
      console.error(error)
    }
  };
}

export default GithubStore