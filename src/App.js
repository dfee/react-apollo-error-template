import React, { Component, PropTypes } from 'react';
import { ApolloClient, compose, withApollo } from 'react-apollo';

import Story from './Story';


class App extends Component {
  static propTypes = {
    client: PropTypes.instanceOf(ApolloClient),
  };

  render() {
    return (
      <main>
        <button onClick={() => this.props.client.resetStore()}>
          Reset Store
        </button>
        <Story id={42} />
      </main>
    );
  }
}

export default compose(
  withApollo,
)(App);
