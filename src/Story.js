import React, { Component, PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import update from 'immutability-helper';


const STORY_QUERY = gql`
query getStory {
  story {
    id
    comments {
      edges {
        node {
          id
          text
        }
      }
    }
  }
}
`

const CREATE_COMMENT_MUTATION = gql`
mutation createComment($comment: CreateCommentInput!){
  createComment(input: $comment) {
    story {
      id
    }
  }
}
`

const NEW_COMMENT_SUBSCRIPTION = gql`
subscription {
  newComment {
    id
    text
  }
}
`

class Story extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      story: PropTypes.shape({
        __typename: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        comments: PropTypes.shape({
          __typename: PropTypes.string.isRequired,
          edges: PropTypes.arrayOf(
            PropTypes.shape({
              node: PropTypes.shape({
                __typename: PropTypes.string.isRequired,
                id: PropTypes.string.isRequired,
                text: PropTypes.string.isRequired,
              })
            })
          ).isRequired,
        }).isRequired,
      }),
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.data.loading && !this.subscription) {
      this.subscription = newProps.data.subscribeToMore({
        document: NEW_COMMENT_SUBSCRIPTION,
        updateQuery: (previousResult, { subscriptionData }) => {
          return update(previousResult, {
            story: {
              comments: {
                edges: {
                  $push: [{
                    __typename: 'CommentEdge',
                    node: subscriptionData.data.newComment,
                  }]
                }
              }
            }
          });
        },
      onError: (err) => console.error(err)
      });
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.mutate({
      variables: {
        comment: {
          text: this.inputComment.value
        }
      }
    }).then(({ data }) => {
        console.log('onSubmit received', data);
      }).catch((error) => {
        console.log('there was an error sending the query', error);
      });
  }

  renderComment = edge => {
    const { node: comment } = edge;
    return (
      <li key={comment.id}>
        <pre>Comment {comment.id}: {comment.text}</pre>
      </li>
    );
  }

  render() {
    const { data: { loading, story } } = this.props;
    if (loading) return <p>Loading...</p>;
    return (
      <div>
        <h3>Story {story.id}</h3>
        <ul>
          {story.comments.edges.map(edge => this.renderComment(edge))}
          <li>
            <input ref={node => this.inputComment = node} defaultValue={'New Comment'}/>
            <button onClick={this.onSubmit}>Submit</button>
          </li>
        </ul>
      </div>
    );
  }
}

export default compose(
  graphql(STORY_QUERY),
  graphql(CREATE_COMMENT_MUTATION),
)(Story);
