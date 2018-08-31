# Manual Trigger Link for ApolloClient example

## Getting started

```bash
yarn install
yarn start
```

## Gettins familiar with the code

Please get familiar with `App.js` and `mock-client.js`.

## Playing with it in dev console

### Access `mocks` object

```js
mocks
```

### Turn mocking on

```js
mocks.on()
```

### Access `triggers` object

`triggers` object is supplied by ManualTriggerLink

```js
mocks.triggers
```

### Inspect current subscriptions

```js
mocks.triggers._inspect()
```

### Simulate all events simultaneously

```js
mocks.triggers._all()
```

### Simulate an individual event

```js
mocks.triggers.newTask()
mocks.triggers.getMessage()
```

### Simulate an individual event with a parameter

```js
mocks.triggers.getMessage({ number: 123 })
```

## Acknowledgements

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
