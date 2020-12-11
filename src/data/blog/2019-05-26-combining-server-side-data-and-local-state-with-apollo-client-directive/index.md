---
category: 'blog'
title: Combining server-side data and local state with Apollo client directive
slug: combining-server-side-data-and-local-state-with-apollo-client-directive
date: 2019-05-26
tags: ["local state", "@client directive"]
published: true
---

Apollo and GraphQL are great. But managing client-side state in Apollo can be horribly verbose. The docs are unclear and the community's feedback, in general, is not very positive. So you might not even consider using Apollo for local state management.

At the same time, it would be great to have a single data source whether it's client- or server-side data. What if you already have data from the server and want to extend it with some client-side state? Apollo may be a good alternative in this case. That is the topic of this article.

We will implement a small React app that loads a list of books from a GraphQL API and renders it. The server-side data is enhanced by a boolean flag marking a book as selected or not by using the `@client` directive.

The complete source code can be found [here](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive) including instructions on how to install and run the project.

If you're interested in handling purely local state with Apollo have a look at this [post](https://jkettmann.com/client-side-state-management-with-apollo-client-directive/).

## Loading the data from the GraphQL API

First, let's create an app that connects to a GraphQL API and loads and renders a list of books. You can find the implementation of the API in the repository or in [this commit](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/tree/step-1). A more detailed explanation can be found in a [previous blog post](https://jkettmann.com/comparing-redux-rest-and-apollo-graphql-for-storing-server-data/).

We create an `Apollo client` pointing to our GraphQL server and then wrap the application content into an `Apollo provider`.

    import React from 'react';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from 'react-apollo';
    import BookList from '../BookList';
    import './App.css';

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
    });

    const App = () => (
      <ApolloProvider client={client}>
        <div className='App'>
          <BookList />
        </div>
      </ApolloProvider>
    );


The `BookList` component uses the Apollo `Query` component to request the list of books inside the `BOOKS_QUERY`. Then it iterates over all results and renders a `Book` component per item.

    import React from 'react';
    import { Query } from 'react-apollo';
    import gql from 'graphql-tag';
    import Book from '../Book';

    const BOOKS_QUERY = gql`
      query {
        books {
          id
          author
          title
        }
      }
    `;

    const BookList = () => (
      <Query query={BOOKS_QUERY}>
        {
          ({ loading, error, data }) => {
            if (loading) {
              return <p>Loading</p>;
            }

            if (error) {
              return <p>Error: {error.message}</p>
            }

            return (
              <React.Fragment>
                {data.books.map(book => (
                  <Book key={book.id} {...book} />
                ))}
              </React.Fragment>
            )
          }
        }
      </Query>
    );


The `Book` component simply renders the book's title and author for now.

    import React from 'react';

    const Book = ({ author, title }) => (
      <p>
        {title} by {author}
      </p>
    );


[Click here for all changes](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/compare/step-1...step-2). When you run the project you already should see the list of books in the browser.

## Adding a client-side flag on a single item in the cache

By now we have the server-side data inside the client-side Apollo cache. The goal is now to combine this data with client-side state. We will allow users to select one or multiple books. We will use a local boolean flag for this.

First, we will extend the `Apollo client` with client-side resolvers.

    import resolvers from './resolvers';

    ...

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
      resolvers,
    });

    const App = () => (
      ...
    );


To add a client-side field to a type defined on the server we first need to add a corresponding `resolver` to our `clientState`. This is basically the same way you would add a custom field to a type on the server. The `Book` resolver gets the same name as the type in the server-side schema. Now the Apollo client knows how to resolve the field `selected`. By default, a book will be unselected.

    import gql from 'graphql-tag';

    const resolvers = {
      Book: {
        selected: (book) => book.selected || false,
      },
    };


Next, we define the mutation to toggle a book's selected state.

We first use the `getCacheKey` to get the key of the book inside the Apollo cache. By default, this will result in `Book:1` for a book with an `id` of `1`.

Then we define the fragment on the `Book` type to read the data currently in the cache and update it afterward. The `selected` field needs to be included in the fragment, otherwise, the update won't work.

Using the cache's `readFragment` function and passing it the fragment as well as the book's id inside the cache we receive the book data. Be aware that you need to use the book's cache id (`Book:1`) instead of the actual id (`1`).

Now we can switch the boolean value of the selected flag and write the updated book data back to the cache. We are not really interested in the result of the mutation, so we just return `null`.

    const resolvers = {
      ...
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


This is, in my opinion, the most complicated part of the code. It looks simple, but if you make a mistake here like using the wrong book id it can be very frustrating and hard to debug.

[Click here to see all changes](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/compare/step-2...step-3).

> One important thing to note: you would need to set the `__typename` field to the data object manually if you didn't read the `book` data from the cache first. The reason is that the result of `readFragment` already contains the `__typename`. See the following code example

    // would create a warning
    cache.writeFragment({ fragment, id, data: { selected: true } })

    // manually added __typename, no warning here
    cache.writeFragment({ fragment, id, data: { selected: true, __typename: 'Book' } })


## Sending the client-side mutation

The next step is to call the mutation. We simply wrap a `Mutation` around the `Book` component and call `toggleBook` in the `onClick` handler passing it the book's id.

    import React from 'react';
    import gql from 'graphql-tag';
    import { Mutation } from 'react-apollo';

    const SELECT_BOOK_MUTATION = gql`
      mutation {
        toggleBook(id: $id) @client
      }
    `;

    const Book = ({ id, author, title }) => (
      <Mutation mutation={SELECT_BOOK_MUTATION}>
        {
          toggleBook => (
            <p onClick={() => toggleBook({ variables: { id } })}>
              {title} by {author}
            </p>
          )
        }
      </Mutation>
    );


When you click on a book name at this point you will see an error message in the console output stating that the `selected` field is missing on the books. We can get around this by simply adding `selected` to our `BOOKS_QUERY` in the `BookList` component. To let the Apollo client know that this field should be fetched from the client state we need to annotated it with the `@client` directive.

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
        ...
      </Query>
    );



We're able to set a client-side flag embedded in server-side data. [Click here to see all changes](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/compare/step-3...step-4). For now, we won't see any updates in the UI, but at least we shouldn't see any errors as well. If you like you can also open the React dev tools and check the book's props. The `selected` flag should be set once you click a book.

## Using the client-side flag alongside server-side data in the component

Now it's time to display the selected state in our book list. Since we added the `selected` field already to the `BOOKS_QUERY` it will be passed down to the `Book` component. So we can get it from the props and set a CSS class accordingly.

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


[Click here to see all changes](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/compare/step-4...step-5). You should be able to click on any book and see it's color changing to red when being selected. By clicking again the book will be unselected.

## Manipulating multiple items in the cache at once

We used the Apollo cache's `readFragment` and `writeFragment` functions to update a single book item in the cache by toggling a flag. Now how can we manipulate multiple items at once? We could try to use these functions to iterate over all required items. But the Apollo cache provides us with another set of functions: `readQuery` and `writeQuery`.

As example let's implement a button, that unselects all books. We start with the `unselectAllBooks` mutation in the `clientState`. We first define the query where we need to include the `selected` field and the `id` field. Then fetch the current data for the query from the cache by calling the `readQuery` function. We iterate over all books in the result and set the `selected` for each book to `false`. Then we write the updated books array back to the cache using the `writeQuery` function. We're again not interested in the result of the mutation so we simply return `null`.

    const resolvers = {
      ...
      Mutation: {
        ...
        unselectAllBooks: (_, args, { cache, getCacheKey }) => {
          const query = gql`
            query {
              books {
                id
                selected
              }
            }
          `;

          const previous = cache.readQuery({ query });
          const books = previous.books.map(book => ({
            ...book,
            selected: false,
          }));

          cache.writeQuery({ query, data: { books } });
          return null;
        }
      },
    };


It's important here to include the `id` field in the query. If the `id` is not there, writing the query to the cache will result in the `BookList` component receiving an empty `data` object. Try it yourself by removing the `id` field and running the code in the [latest commit](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/releases/tag/step-5). You should see an error in the console.

If the `id` field is there and you selected a few books, all of them should be unselected once you click the "Unselect all books" button.

> With `writeQuery` it's important to include the `id` field in the query. If the `id` is not there, writing the query to the cache will fail.

[To see all changes click here](https://github.com/jkettmann/enhancing-server-side-state-with-apollo-client-directive/compare/step-5...step-6).

## Summary

In this article, we had a look at how to combine server-side data with local state. For updating single items the Apollo cache's `readFragment` and `writeFragment` functions are the way to go. If you need more complex manipulation of multiple items the `readQuery` and `writeQuery` functions may be more appropriate.

If you're interested in setting client-side only state the approach is very similar. Check out the [previous post](https://jkettmann.com/client-side-state-management-with-apollo-client-directive/) if you want more detail.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>