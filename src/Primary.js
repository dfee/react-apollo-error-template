import React, { Component, PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';


const PRIMARY_QUERY = gql`
query {
  primary {
    ... on Story {
      __typename
      id
    }
    ... on Person {
      __typename
      id
      name
    }
  }
}
`

class Primary extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  renderStory = (story) => <div key={story.id}>Story {story.id}</div>
  renderPerson = (person) => <div key={person.id}>Person {person.id} {person.name}</div>

  renderPrimary = (item) => {
    if (item.__typename === 'Person') return this.renderPerson(item);
    if (item.__typename === 'Story') return this.renderStory(item);
  }

  render() {
    const { data: { loading, primary } } = this.props;
    if (loading) return <p>Loading...</p>;
    return (
      <div>
        <h3>Current primary objects (people &amp; stories)</h3>
        {primary.map(item => this.renderPrimary(item))}
      </div>
    );
  }
}

export default compose(
  graphql(PRIMARY_QUERY),
)(Primary);
