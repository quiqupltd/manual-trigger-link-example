/**
 * Keep mock client in a separate file to make it's loading optional
 * (because make schema and introspection stuff is heavy and not suitable for production).
 */
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { SchemaLink } from 'apollo-link-schema'
import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import {
  makeExecutableSchema,
  introspectSchema,
  addMockFunctionsToSchema,
  MockList,
} from 'graphql-tools'
import { printSchema } from 'graphql/utilities/schemaPrinter'
import ManualTriggerLink from '@quiqupltd/manual-trigger-link'

const DEFAULT = {
  fetchOptions: {
    credentials: 'include',
  },
}

/**
 * Generates a mock apollo client with a specified set of options based on default config.
 */
const createMockClient = async (options = {}) => {
  const {
    uri,
    fetchOptions,
    mock: {
      // Mock data generation options (see SchemaLink docs)
      mocks,
      // Mocked value resolvers
      rootValue,
      // Custom schema
      schema,
      // Set triggers func for ManualTriggerLink
      setTriggers,
    },
  } = Object.assign({}, DEFAULT, options)
  // You can pass schema manually or SchemaLink will fetch it for you
  const typeDefs =
    schema ||
    printSchema(
      await introspectSchema(
        new HttpLink({
          uri,
          credentials: fetchOptions.credentials,
        })
      )
    )
  const schemaExecutable = makeExecutableSchema({ typeDefs })

  // This is where we register our mocks in the schema
  addMockFunctionsToSchema({ schema: schemaExecutable, mocks })
  // This is where we pass the schema, rootValue (for resolvers) and a context to SchemaLink
  const schemaLink = new SchemaLink({
    schema: schemaExecutable,
    rootValue,
    context: operation => {
      const { mockingParams } = operation.getContext()
      return mockingParams || null
    },
  })
  // We want to have manual intervention only for subscriptions. Normal queries execute right away.
  const link = ApolloLink.split(
    hasSubscription,
    ApolloLink.from([new ManualTriggerLink({ setTriggers }), schemaLink]),
    schemaLink
  )
  const cache = new InMemoryCache()
  return new ApolloClient({ cache, link })
}

export default {
  createMockClient,
  // If you link it with `yarn link`, you must use this MockList because internally it checks for `instanceof`
  MockList,
}

function hasSubscription({ query }) {
  const { kind, operation } = getMainDefinition(query)
  return kind === 'OperationDefinition' && operation === 'subscription'
}
