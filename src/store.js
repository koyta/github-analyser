import { action, computed, observable, toJS, useStrict, when, } from 'mobx'
import { apiCall } from './utils/apiCall'
import { enableLogging } from 'mobx-logger'

enableLogging()
useStrict(false)

class GithubStore {

  @observable chartData = []

  @observable _repos = []
  @observable _user = {}

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
  get starredRepos () {
    if (this._repos === 0) {
      return 0
    }
    let result = 0;
    this._repos.forEach(repo => {
      result += repo.stargazers_count
    })
    return result;
  }

  @computed
  get sortedOverallLanguagesValues () {
    return this._overallLanguages.entries().sort((a, b) => {
      return a[1] < b[1]
    })
  }

  @computed get userLink () {
    return this._user.html_url
  }

  @computed
  get languagesEntries () {
    if (this._repos.length === 0) {
      return []
    }
    return this._repoLanguages.entries()
  }

  @computed
  get languagesKeys () {
    if (this._repos.length === 0) {
      return []
    }
    return this._repoLanguages.keys()
  }

  @computed
  get languagesValues () {
    if (this._repos.length === 0) {
      return []
    }
    return this._repoLanguages.values()
  }

  @computed
  get languagesSummary () {
    if (this._overallLanguages.size === 0) {
      return -1
    }
    return this._overallLanguages.values().reduce((res, item) => {
      return res += item
    })
  }

  @action('Очищаем хранилище языков программирования')
  eraseRepos () {
    try {
      this._repoLanguages = observable([])
      this._repos = observable([])
      this._overallLanguages = observable.shallowMap({})
    }

    catch (error) {
      console.log(error)
      throw new Error(`${error.type}: ${error.message}`)
    }
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

  @action('Очищаем хранилище пользователя')
  eraseUser () {
    try {
      this._user = observable([])
    }
    catch (error) {
      console.log(error)
      throw new Error(`${error.type}: ${error.message}`)
    }
  }

  @action('Скачиваем данные пользователя')
  async fetchUserInfo (user) {
    this.eraseUser()
    try {
      this._state = 'pending'
      let response = await apiCall.get(`/users/${user}`)
      this._user = response.data
      console.log(response.data)
      console.log(this._user)
      this._state = 'done'
    } catch (error) {
      console.error(`Error while fetching user data. ${error}`)
    }
  }

  @action('Скачиваем данные репозиториев пользователя')
  async fetchUserReposInfo (user) {
    this.eraseRepos()
    try {
      this._state = 'pending'
      let response = await apiCall.get(`/users/${user}/repos`)
      this._repos = await response.data
      await this.calcLangsForUser()
      this._state = 'done'
    } catch (error) {
      console.error(`Error while fetching language data. ${error}`)
    }
  };
}

export default GithubStore