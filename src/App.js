import React, { Component, PropTypes } from 'react';
import { ApolloClient, compose, withApollo } from 'react-apollo';

import Person from './Person';
import Primary from './Primary';


class App extends Component {
  static propTypes = {
    client: PropTypes.instanceOf(ApolloClient),
  };

  render() {
    return (
      <main>
        <h1>Directions</h1>
        <p>Add a person (bottom) and then click `reset store`.</p>
        <p>You'll notice that current people is updated, but not current primary objects.</p>
        <button onClick={() => this.props.client.resetStore()}>
          Reset Store
        </button>
        <Primary />
        <Person />
      </main>
    );
  }
}

export default compose(
  withApollo,
)(App);
