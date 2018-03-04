import { action, computed, observable, toJS, useStrict, when, } from 'mobx'
import { apiCall } from './utils/apiCall'
import { enableLogging } from 'mobx-logger'

enableLogging()
useStrict(true)

class GithubStore {

  @observable chartData = []

  @observable _repos = []

  _state = 'done' // pending | done | error

  @computed get state () {
    return this._state
  }

  @observable _repoLanguages = []

  @computed
  get repoLanguages () {
    return this._repoLanguages
  }

  @observable _overallLanguages = observable.shallowMap({})

  @computed
  get overallLanguages () {
    return this._overallLanguages
  }

  @computed
  get sortedOverallLanguagesValues () {
    let sorted = this._overallLanguages.entries().sort((a, b) => {
      console.log(a);console.log(b); console.log(' ');
      return a[1] < b[1];
    });
    return sorted;
  }

  @computed
  get languagesSummary () {
    let sum = 0;
    this._overallLanguages.entries().forEach((item, i) => {
      sum += item[1]
    })
    return sum
  }

  @action('Считаем языки для юзера')
  async calcLangsForUser () {
    try {
      this._state = 'pending'
      let langs = this._repos.map(async repo => {
        let response = await apiCall.get(repo.languages_url)
        let data = response.data
        return {
          id: repo.id,
          data: data,
        }
      })
      this._repoLanguages = await Promise.all(langs)
      this._repoLanguages.forEach(item => {
        let langs = toJS(item).data
        Object.keys(langs).forEach(lang => {
          if (this._overallLanguages.has(lang)) {
            // Если уже есть язык, то складываем значение
            this._overallLanguages.set(lang,
              (langs[lang] + this._overallLanguages.get(lang)))
          } else {
            // Если нет языка, то добавляем его
            this._overallLanguages.set(lang, langs[lang])
          }
        })
      })
      this._state = 'done'
    } catch (error) {
      console.error(error)
      this._state = 'error'
      throw new Error(error)
    }

    when('State listener', () => {
      return this.state === 'error'
    }, () => {
      console.log('error')
    })

  }

  @action('Скачиваем данные с гитхаба')
  async fetchUserInfo (url) {
    try {
      this._state = 'pending'
      let response = await apiCall.get(url)
      this._repos = await response.data
      await this.calcLangsForUser()
      this._state = 'done'
    } catch (error) {
      console.error(error)
    }
  };
}

export default GithubStore