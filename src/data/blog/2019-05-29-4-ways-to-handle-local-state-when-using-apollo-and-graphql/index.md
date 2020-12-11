---
category: 'blog'
title: 4 ways to handle local state when using Apollo and GraphQL
slug: 4-ways-to-handle-local-state-when-using-apollo-and-graphql
date: 2019-05-29
tags: ["local state", "@client directive"]
published: true
---

There are a lot of options for state-management in the React eco-system. Using Apollo and GraphQL is a great way to handle server-side data with little boilerplate. But the community is still young and there often has not been established a best practice yet. The question here is how to handle client-side state. What solutions are there and what are the pros and cons?

## Handling client-side state with Apollo

With Apollo there is an option to handle local state inside Apollo itself. But to many, it's still a shrouded mystery. The docs are verbose in many occasions and debugging can be hard. At the same time, it's great to have all the data in the same location and not introduce yet another programming paradigm. One of the best use-cases for Apollo as client-state management system is when you need to enhance server-side data with local state.

Let's take a quick look at an example from [this more detailed article about combining server and local data](https://http://jkettmann.com/combining-server-side-data-and-local-state-with-apollo-client-directive/). We have a GraphQL server that exposes a list of books with following type.

    type Book {
      id: String!
      author: String!
      title: String!
    }

    type Query {
      books: [Book]
    }


The goal is now to extend the Book type with a client-side boolean flag to indicate if it has been selected by the user. We can achieve this by passing a `resolvers` object to the Apollo provider. The `selected` flag is added by the `Book` resolver and defaults to `false`. We also implement a `toggleBook` mutation. This gets the existing book data for a certain ID from the Apollo cache and toggles the `selected` flag.

    import React from 'react';
    import gql from 'graphql-tag';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from 'react-apollo';

    import BookList from './BookList';

    const resolvers = {
      Book: {
        selected: (book) => book.selected || false,
      },
      Mutation: {
        toggleBook: (_, args, { cache, getCacheKey }) => {
          const id = getCacheKey({ id: args.id, __typename: 'Book' });
          const fragment = gql`
            fragment bookToSelect on Book {
              selected
            }
          `;
          const book = cache.readFragment({ fragment, id });
          const data = { ...book, selected: !book.selected };
          cache.writeFragment({ fragment, id, data });
          return null;
        },
      },
    };

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
      resolvers,
    });

    const App = () => (
      <ApolloProvider client={client}>
        <BookList />
      </ApolloProvider>
    );


The book list includes the `selected` flag in the query annotated with the `@client` directive. This indicates to the Apollo client that this data needs to be resolved on the client.

    import React from 'react';
    import { Query } from 'react-apollo';
    import gql from 'graphql-tag';
    import Book from './Book';

    const BOOKS_QUERY = gql`
      query {
        books {
          id
          author
          title
          selected @client
        }
      }
    `;

    const BookList = () => (
      <Query query={BOOKS_QUERY}>
        {
          ({ data }) => data.books && (
            <React.Fragment>
              {data.books.map(book => (
                <Book key={book.id} {...book} />
              ))}
            </React.Fragment>
          )
        }
      </Query>
    );


The book component calls the `toggleBook` mutation and provides its ID as variable. Inside the definition of the mutation we again use the `@client` directive.

    import React from 'react';
    import gql from 'graphql-tag';
    import { Mutation } from 'react-apollo';
    import './Book.css';

    const SELECT_BOOK_MUTATION = gql`
      mutation {
        toggleBook(id: $id) @client
      }
    `;

    const Book = ({ id, author, title, selected }) => (
      <Mutation mutation={SELECT_BOOK_MUTATION}>
        {
          toggleBook => (
            <p
              className={selected ? 'selected' : 'not-selected'}
              onClick={() => toggleBook({ variables: { id } })}
            >
              {title} by {author}
            </p>
          )
        }
      </Mutation>
    );


Combining server and local data like this results in a consistent approach to fetching data inside our components. We could have kept the local data in a separate store like an array of selected book IDs inside a Redux store. But then we would have to check for every book if it is included in this array or not. This alone is not a big deal, of course. But if you think of the additional overhead of writing the read and write logic to get the data in and out of the store it's well worth taking Apollo for client-state management in consideration.

If you want to have a more detailed look at this and a more complex example check out this article about [combining server-side data and local state with Apollo's client directive](https://http://jkettmann.com/combining-server-side-data-and-local-state-with-apollo-client-directive/).

## Handling global client state with React Context

The above example might seem like overkill for situations where you have local state that is not related to server-side data. In many cases, the built-in React API is actually sufficient. Let's take a look at common use-case: A modal window. This is probably not the best way to implement a modal but it's a good example for using React's context API.

We extend the above example with a `Modal` component, its context and a button to open it. The `App` component uses its local state to store information about whether the modal is open or not. It also has a function that allows switching the `isModalOpen` flag to `true`. The flag and the function are passed to the modal's context provider.

    import React from 'react';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from 'react-apollo';
    import Modal, { ModalContext } from '../Modal';
    import OpenModalButton from '../OpenModalButton';
    import BookList from '../BookList';

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
    });

    class App extends React.Component {
      state = {
        isModalOpen: false,
      }

      openModal = () => {
        this.setState({ isModalOpen: true });
      }

      render() {
        const { isModalOpen } = this.state;
        const openModal = this.openModal;
        return (
          <ApolloProvider client={client}>
            <ModalContext.Provider value={{ isModalOpen, openModal }}>
              <BookList />

              <OpenModalButton />
              <Modal />
            </ModalContext.Provider>
          </ApolloProvider>
        );
      }
    }


The modal itself defines the context via `React.createContext`. The `Modal` component uses the context's consumer to get access to the context value which is defined in the `App` component. It only renders the actual modal when the `isModalOpen` flag is set.

    import React from 'react';

    const defaultContext = {
      isModalOpen: false,
      openModal: () => ({ isModalOpen: true }),
    };

    export const ModalContext = React.createContext(defaultContext);

    const Modal = () => (
      <ModalContext.Consumer>
        {
          ({ isModalOpen }) => isModalOpen && (
            <div className="modal">
              This is a modal
            </div>
          )
        }
      </ModalContext.Consumer>
    );


The `OpenModalButton` component also uses the modal context's consumer to access the `openModal` function defined in the `App` component. Once the button is clicked the `isModalOpen` flag in the `App` component's state is toggled and the modal window becomes visible.

    import React from 'react';
    import { ModalContext } from '../Modal';

    const OpenModalButton = () => (
      <ModalContext.Consumer>
        {
          ({ openModal }) => (
            <button onClick={openModal}>
              Open Modal
            </button>
          )
        }
      </ModalContext.Consumer>
    );


Using React's context API for client-side state is simple and probably much easier to implement if you never used Apollo for local state management before. In case you're interested in how this modal window can be implemented using Apollo you can refer to [this article](https://jkettmann.com/client-side-state-management-with-apollo-client-directive/).

## Component state for simple use-cases

Using React's context API, Apollo or another solution for managing global state are all valid approaches. But in many cases using simple component state is enough. Why risk a global re-render when the scope of the state is limited to a single component?

In the following example, we only want to show a small info box inside a component. Using global state would be over the top here since it's more complicated to implement and maintain.

    import React from 'react';

    class SomeComponent extends React.Component {
      state = {
        isInfoBoxOpen: false,
      }

      openInfoBox = () => {
        this.setState({ isInfoBoxOpen: true });
      }

      render() {
        return (
          <div className="container">
            <button onClick={this.openInfoBox}>
              Open info box
            </button>
            {
              this.state.isInfoBoxOpen && <InfoBox />
            }
          </div>
        );
      }
    }


## Third-party state management solutions

If you still are in need of a different solution for state management you can, of course, use packages like [Redux](https://redux.js.org/) or [Mobx](https://mobx.js.org/). The disadvantage is that you introduce new dependencies and additional programming paradigms. At the same time, you add another source for the data making it more complicated to combine data from both sources if required.

## Conclusion

Most cases for local state management can be covered by using the context API or component state if you don't want to migrate fully to Apollo. Apollo can be a bit complicated and verbose to use in the beginning but is a great solution when you need to extend server-side data with client-side state. In other situations, it might be overkill but at least you would have the benefit of being able to use the Apollo dev tools.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>