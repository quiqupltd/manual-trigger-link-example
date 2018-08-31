import React, { Component } from 'react'
import { ApolloProvider, Query, Subscription } from 'react-apollo'
import gql from 'graphql-tag'
import logo from './logo.svg'
import './App.css'

const KEY = 'manual-intervention-example'

const QUERY = gql`
  query {
    header
  }
`

const SUBSCRIPTION = gql`
  subscription newTask {
    task {
      text
      completed
    }
  }
`

const SUBSCRIPTION2 = gql`
  subscription getMessage {
    message
  }
`

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { client: null }
    if (process.env.REACT_APP_SUPPORT_MOCKS) {
      window.mocks = {}
      window.mocks.on = this.mocksOn
      window.mocks.off = this.mocksOff
    }
  }

  async componentDidMount() {
    try {
      const mocks = window.localStorage.getItem(KEY)
      process.env.REACT_APP_SUPPORT_MOCKS && mocks === 'ON'
        ? await this.mocksOn()
        : await this.mocksOff()
    } catch (e) {
      await this.mocksOff()
    }
  }

  mocksOn = async () => {
    const mockClientModule = await import('./mock-client')
    const schemaModule = await import('./schema.graphql')
    const client = await mockClientModule.default.createMockClient({
      mock: {
        mocks: {
          // This is a custom type resolver. Comment it and see what happens.
          Task: () => ({
            text: `My next task #${Math.round(Math.random() * 100)}`,
            completed: Math.random() > 0.5,
          }),
        },
        // These are static resolvers or mocks, which have context access
        rootValue: {
          message: (_root, _variables, context) =>
            `I am message #${context ? context.number : 'unknown'}`,
        },
        schema: schemaModule.default,
        setTriggers: triggers => {
          window.mocks.triggers = triggers
        },
      },
    })
    this.setState({ client }, () => {
      try {
        window.localStorage.setItem(KEY, 'ON')
      } catch (e) {}
      if (process.env.REACT_APP_SUPPORT_MOCKS) console.info('MOCKS are ON')
    })
  }

  mocksOff = async () => {
    // create your normal client here
    const client = null
    this.setState({ client }, () => {
      try {
        window.localStorage.setItem(KEY, 'OFF')
      } catch (e) {}
      if (process.env.REACT_APP_SUPPORT_MOCKS) console.info('MOCKS are OFF')
    })
  }

  render() {
    const { client } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">
            Welcome to Manual Trigger Link for ApolloClient example
          </h1>
        </header>
        <div className="App-intro">
          {client == null ? (
            <p>No GraphQL client available</p>
          ) : (
            <ApolloProvider client={client}>
              <Query query={QUERY}>{({ data }) => <p>{data.header}</p>}</Query>
              <Subscription subscription={SUBSCRIPTION}>
                {({ data }) => {
                  return data ? (
                    <p
                      style={{
                        textDecoration: data.task.completed
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {data.task.text}
                    </p>
                  ) : null
                }}
              </Subscription>
              <Subscription subscription={SUBSCRIPTION2}>
                {({ data }) => {
                  return data ? <p>{data.message}</p> : null
                }}
              </Subscription>
            </ApolloProvider>
          )}
        </div>
      </div>
    )
  }
}

export default App
