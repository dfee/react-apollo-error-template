import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import {
  connectionDefinitions,
  connectionFromArray,
  mutationWithClientMutationId,
} from 'graphql-relay';


/* Begin Story */
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
    id: {type: GraphQLID},
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
/* End Story */


/* Begin People */
const PEOPLE = [
  {id: 0, name: 'abe'},
  {id: 1, name: 'bill'},
  {id: 2, name: 'carl'},
]

var PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    id: {type: GraphQLID},
    name: {type: GraphQLString},
  })
})

var CreatePersonMutation = mutationWithClientMutationId({
  name: 'CreatePerson',
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    person: {
      type: PersonType,
      resolve: () => PEOPLE[PEOPLE.length - 1],
    },
  },
  mutateAndGetPayload: ({name}) => {
    var newPerson = {
      id: PEOPLE.length.toString(),
      name,
    };
    PEOPLE.push(newPerson);
    return newPerson;
  },
});
/* End People */


/* Begin Union */
const PrimaryType = new GraphQLUnionType({
  name: 'PrimaryType',
  types: [StoryType, PersonType],
  resolveType: (data) => {
    if (data.name) {
      return PersonType;
    }
    if (data.comments) {
      return StoryType;
    }
  }
})
/* End Union */

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      primary: {
        type: new GraphQLList(PrimaryType),
        resolve: () => PEOPLE.concat([STORY])
      },
      people: {
        type: new GraphQLList(PersonType),
        resolve: () => PEOPLE,
      },
      story: {
        type: StoryType,
        resolve: () => STORY,
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      createPerson: CreatePersonMutation,
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
