import React, { Component, PropTypes } from 'react';
import { ApolloClient, compose, gql, graphql, withApollo } from 'react-apollo';

const PEOPLE_QUERY = gql`
query {
  people {
    id
    name
  }
}`

class App extends Component {
  static propTypes = {
    client: PropTypes.instanceOf(ApolloClient),
    data: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        people: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            })
        ),
    }).isRequired,
  };

  resetStore = () => this.props.client.resetStore();

  render() {
    const { data: { loading, people } } = this.props;
    return (
      <main>
        <header>
          <h1>Apollo Client Error Template</h1>
          <p>
            This is a template that you can use to demonstrate an error in Apollo Client.
            Edit the source code and watch your browser window reload with the changes.
          </p>
          <p>
            The code which renders this component lives in <code>./src/App.js</code>.
          </p>
          <p>
            The GraphQL schema is in <code>./src/graphql/schema</code>.
            Currently the schema just serves a list of people with names and ids.
          </p>
        </header>
        <button onClick={() => this.resetStore()}>Reset Store</button>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul>
            {people.map(person => (
              <li key={person.id}>
                {person.name}
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }
}

export default compose(
  graphql(PEOPLE_QUERY),
  withApollo,
)(App);
