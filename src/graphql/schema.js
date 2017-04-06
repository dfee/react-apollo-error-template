import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import {
  connectionDefinitions,
  connectionFromArray,
  mutationWithClientMutationId,
} from 'graphql-relay';


const STORY = {
  comments: [{id: 'a0', text: 'Hello'}],
  id: '42',
};


var CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    id: {type: GraphQLID},
    text: {type: GraphQLString},
  }),
});

const {connectionType: commentConnection} =
  connectionDefinitions({name: 'Comment', nodeType: CommentType});

var StoryType = new GraphQLObjectType({
  name: 'Story',
  fields: () => ({
    id: { type: GraphQLString },
    comments: {
      type: commentConnection,
      resolve: (story, args) => connectionFromArray(story.comments, args),
    },
    comments_old: { type: new GraphQLList(CommentType) },
  }),
});


var CreateCommentMutation = mutationWithClientMutationId({
  name: 'CreateComment',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    story: {
      type: StoryType,
      resolve: () => STORY,
    },
  },
  mutateAndGetPayload: ({text}) => {
    var newComment = {
      id: 'a' + STORY.comments.length.toString(),
      text,
    };
    STORY.comments.push(newComment);
    dispatchEvent(new CustomEvent('SUBSCRIPTION_DATA', { detail: { id: '0' } }));
    return newComment;
  },
});


export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      story: {
        type: StoryType,
        resolve: () => STORY,
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      createComment: CreateCommentMutation,
    }),
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: () => ({
      newComment: {
        type: CommentType,
        resolve: () => STORY.comments[STORY.comments.length - 1],
      },
    }),
  }),
});
