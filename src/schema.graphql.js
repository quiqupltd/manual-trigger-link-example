import gql from 'graphql-tag'

export default gql`
  schema {
    query: RootQueryType
    subscription: RootSubscriptionType
  }

  type RootQueryType {
    header: String
  }

  type RootSubscriptionType {
    task: Task
    message: String
  }

  type Task {
    text: String
    completed: Boolean
  }
`
