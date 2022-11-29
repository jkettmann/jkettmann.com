---
category: 'blog'
title: Comparing Redux+REST and Apollo+GraphQL for storing server-side data
slug: comparing-redux-rest-and-apollo-graphql-for-storing-server-data
date: 2019-02-05
tags: ['Redux vs. Apollo']
published: true
---

- Can I use GraphQL + Apollo alternative to Redux?

Many of us use Redux in our frontend applications and really like it. I was one of these people. When GraphQL came around it was initially hard to let go of Redux.

Don't get me wrong. There are still use-cases for Redux. But let me phrase it with [Max Stoiber's words](https://twitter.com/mxstbr/status/1048538450050404359):

_100% of devs who think Redux is "too complex" use it as a client-side cache of server-side data. Don't. Just don't. Redux doesn't work well for that._

So when does Apollo + GraphQL have advantages over Redux + REST? In this post, I will show you how to implement simple data fetching from a server for both cases. In a second post, I will talk about handling client-side state.

You can find the source code for this post inside [this repository](https://github.com/jkettmann/comparing-redux-and-apollo-for-server-side-data). Have a look at the commits as well to follow the steps below.

## Fetching data from a GraphQL server with Apollo

Since we want to fetch data from a server let's first create the GraphQL API. It will provide a `books` field, which is an array of books containing a `title` and an `author`.

### The GraphQL server

Every GraphQL API needs a schema that defines what data a client can fetch. This means we need to define the schema and its types.

    import { gql } from 'apollo-server-express';

    const typeDefs = gql`
      type Book {
        id: String!
        author: String!
        title: String!
      }

      type Query {
        books: [Book]
      }
    `;

The `Query` type is the entry point for a client's data request. But the schema alone is not enough. We need to implement the logic that is connecting the schema to our data source. This is done in the resolvers.

    import books from '../books';

    const resolvers = {
      Query: {
        books: () => books,
      },
    };

The data source is here a simple array of book objects.

    const books = [
      {
        id: '1',
        author: 'Maurice Moss',
        title: 'Yesterday\'s Jam',
      },
      {
        id: '2',
        author: 'Jen Barber',
        title: 'Calamity Jen',
      },
      {
        id: '3',
        author: 'Roy Trenneman',
        title: 'Fifty-Fifty',
      },
    ];

Then we hook the GraphQL types and the resolvers together by using [apollo-server-express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) and start the server. The API is now exposed at [localhost:4000/graphql](localhost:4000/graphql).

    import express from 'express';
    import { ApolloServer } from 'apollo-server-express';
    import typeDefs from './typeDefs';
    import resolvers from './resolvers';

    const app = express();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () => {
      console.log(`🚀 GraphQL server ready at http://localhost:4000${server.graphqlPath}`);
    });

This is some boilerplate we need to set up to get the GraphQL API running, but it will be totally worth it, as you will see now.

### Connecting the React frontend with Apollo

In order to use Apollo in our components, we first need to initialize it correctly. Basically, we create an `Apollo client` and wrap our app into an `Apollo provider`.

    import React from 'react';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from 'react-apollo';
    import BooksList from './ApolloBooksList';

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
    });

    const ApolloApp = () => (
      <ApolloProvider client={client}>
        <BooksList />
      </ApolloProvider>
    );

The component that fetches and renders the books list is now fairly simple. It just uses the `Query` component provided by Apollo and handles the response. It uses a query which exactly defines the data requirements for the component.

    import React from 'react';
    import { Query } from 'react-apollo';
    import gql from 'graphql-tag';

    const BOOKS_QUERY = gql`
      query {
        books {
          author
          title
        }
      }
    `;

    const ApolloBooksList = () => (
      <Query query={BOOKS_QUERY}>
        {
          ({ loading, error, data }) => {
            if (loading) {
              return <p>Loading</p>;
            }

            if (error) {
              return <p>Error: {error}</p>
            }

            return (
              <React.Fragment>
                {data.books.map(({ author, title }) => (
                  <p key={title}>
                    {title} by {author}
                  </p>
                ))}
              </React.Fragment>
            )
          }
        }
      </Query>
    );

That's it! As you can see writing a component that fetches data from a server this way was very simple. And as you may have recognized: We get a loading and error state for free!

Now let's see how the same result can be achieved using Redux and a REST API.

## Fetching data from a REST API using Redux

Let's start again with the server. This time we will implement a simple REST endpoint.

### The REST API

We only need one simple endpoint that returns the books in JSON format. That's really easy using express. We register a GET endpoint at `/books` that stringifies and sends the books array.

    import express from 'express';
    import cors from 'cors';
    import books from '../books';

    const app = express();
    app.use(cors());

    app.get('/books', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(books));
    });

    app.listen({ port: 5000 }, () => {
      console.log('🚀 REST server ready at http://localhost:5000');
    });

Compared to the GraphQL server we saved some lines of code obviously. But how are we going to implement the frontend?

### Connecting the frontend with the REST API

For a proper Redux implementation, we will need to define `actions`, `reducers` and `selectors` and we need to set up the `store`.

We want to load the books array from the REST API and set them to the Redux state afterward. We thus need two action creators. The one for loading will be a thunk to be asynchronous.

    import axios from 'axios';

    export const loadBooks = () => async (dispatch) => {
      const response = await axios.get('http://localhost:5000/books');
      const books = response.data;
      dispatch(setBooks(books));
    }

    export const setBooks = (books) => ({
      type: 'SET_BOOKS',
      books,
    });

Now we define the reducer that handles the actions. In our case, we only need to handle the `SET_BOOKS` action.

    const initialState = {
      books: [],
    };

    const reducer = (state = initialState, action) => {
      switch(action.type) {
        case 'SET_BOOKS': {
          return {
            ...state,
            books: action.books,
          };
        }

        default:
          return state;
      }
    };

We create the store from the reducers and dispatch the loading action as soon as the page has loaded.

    import { createStore, applyMiddleware, compose } from 'redux';
    import thunk from 'redux-thunk';
    import reducer from './reducer';
    import { loadBooks } from './actions';

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(
      reducer,
      composeEnhancers(applyMiddleware(thunk)),
    );

    store.dispatch(loadBooks());

Next, we patch everything together by wrapping our app in a `Redux provider`.

    import React from 'react';
    import { Provider } from 'react-redux';
    import store from './store';
    import BooksList from './ReduxBooksList';

    const ReduxApp = () => (
      <Provider store={store}>
        <BooksList />
      </Provider>
    );

Now we have a React app that is ready to be used together with Redux. But we still need to get the data in our components to display it to the user.

The `BooksList` component will be similar to the one we used in the Apollo app. But in a real-world project, we would define a `selector` first in order to get the books array from the Redux state.

    import { createSelector } from 'reselect';

    // The `stateSelector` was only used to make `reselect` here.
    // It wouldn't be used in a real project in this way.
    const stateSelector = state => state;

    export const booksSelector = createSelector(
      stateSelector,
      state => state.books || [],
    );

Finally, we can implement our `Booklist` component by connecting it to Redux.

    import React from 'react';
    import { connect } from 'react-redux';
    import { booksSelector } from './selectors';

    const ReduxBooksList = ({ books }) => (
      <React.Fragment>
        {
          books.map(({ author, title }) => (
            <p key={title}>
              {title} by {author}
            </p>
          ))
        }
      </React.Fragment>
    );

    const mapStateToProps = (state) => ({
      books: booksSelector(state),
    });

    export default connect(mapStateToProps)(ReduxBooksList);

Now we're done. As you can see this was quite some boilerplate to simply fetch and render some data from a REST API. In fact, the Apollo app above is still superior since it already implemented a loading and error state.

## Summary

We saw in this post a simple implementation of an app that renders server-side data with Redux + REST and Apollo + GraphQL. The Apollo app was much quicker to build and still had more features. And we didn't even touch topics like normalization of the Redux state, mapping and combining data from multiple REST endpoints to UI requirements or fetching nested data.

On the other hand, this post only considered server-side data. But what about client-side state? This will be the topic of a second post.

import Newsletter from 'components/Newsletter'

<Newsletter formId="ZBGZ4J"/>
