import React, { Component } from 'react';
import { compose, gql, graphql } from 'react-apollo';

const PEOPLE_QUERY = gql`
query {
  people {
    id
    name
  }
}
`

const CREATE_PERSON_MUTATION = gql`
mutation createPerson($person: CreatePersonInput!){
  createPerson(input: $person) {
    person {
      id
      name
    }
  }
}
`

class Person extends Component {
  constructor(props) {
    super(props);
    this.subscription = null;
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.mutate({
      variables: {
        person: {
          name: this.inputName.value
        }
      }
    }).then(({ data }) => {
        console.log('onSubmit received', data);
      }).catch((error) => {
        console.log('there was an error sending the query', error);
      });
  }

  renderPerson = (person) => <div key={person.id}>Person {person.id} {person.name}</div>;

  render() {
    const { data: { loading, people } } = this.props;
    if (loading) return <div>...loading</div>;
    return (
      <div>
        <h3>Current people</h3>
        {people.map(person => this.renderPerson(person))}
        <h3>Add person</h3>
        <input ref={node => this.inputName = node} defaultValue={'New Person'}/>
        <button onClick={this.onSubmit}>Submit</button>
      </div>
    );
  }
}

export default compose(
  graphql(PEOPLE_QUERY),
  graphql(CREATE_PERSON_MUTATION),
)(Person);
