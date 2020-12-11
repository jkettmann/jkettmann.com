---
category: 'blog'
title: "Testing Apollo: How to test if a mutation was called with MockedProvider?"
slug: testing-apollo-how-to-test-if-a-mutation-was-called-with-mockedprovider
date: 2019-08-23
tags: ["Testing"]
published: true
---

Support for testing components that use Apollo is very good for the most part. But still, some situations are confusing and not well documented. One of those is covered in this post: Testing mutations.

Buttons triggering a mutation are an important part of interactive web applications. And everything important should be tested, right? So how can we make sure that the desired mutation was executed?

## The Component

First things first. We need to have a component that we can test. So let's define one:

    import React from 'react';
    import { useMutation } from '@apollo/react-hooks';
    import gql from 'graphql-tag';

    export const ADD_BOOK_MUTATION = gql`
      mutation addBook($title: String!, $author: String!) {
        addBook(title: $title, author: $author) {
          id
          title
          author
        }
      }
    `;

    function AddBookButton() {
      const [addBook] = useMutation(ADD_BOOK_MUTATION, {
        variables: {
          title: 'The Shining',
          author: 'Steven King',
        },
      });

      return (
        <button onClick={addBook}>
          Add book
        </button>
      );
    }

    export default AddBookButton;


We now have a simple component that we can test. It renders a button which triggers the `ADD_BOOK` mutation. The mutation will be called with the given variables.

## The Problem

When we render a component that makes use of Apollo we need to wrap it with an Apollo provider. Otherwise, it will complain that no Apollo client is available. Since we don't want to send real requests to a GraphQL API we use `MockedProvider` from [@apollo/react-testing](https://www.apollographql.com/docs/react/api/react-testing/).

MockedProvider expects a list of mocks which corresponds to all the requests and responses that should be fired in our test. Usually, you would provide a request and a result or error object inside each mock like in this example.

    const mocks = [
      {
        request: {
          query: ADD_BOOK_MUTATION,
          variables: {
            title: 'The Shining',
            author: 'Steven King',
          },
        },
        result: {
          data: {
            addBook: {
              id: '2',
              title: 'The Shining',
              author: 'Steven King',
            },
          },
        },
      },
    ];

    const renderComponent = () => render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <YourComponent />
      </MockedProvider>
    );


Now let's say your component sends the mutation and renders the result into the DOM. In this case, you can test if the mutation was called implicitly. You simply check if the mutation result has been rendered somewhere. If yes, your mutation worked.

But what if you don't render any result? Now it might be great to check if some function was called.

## The Solution

The secret here is to make use of the `newData` field. This is a function which you can set instead of the result object to create mock data dynamically. If you assign a mock function here you can simply assert whether or not that function was called.

But enough talking, let's have a look at a simple unit test:

    import React from 'react';
    import { render, wait, fireEvent } from '@testing-library/react'
    import { MockedProvider } from '@apollo/react-testing';
    import AddBookButton, { ADD_BOOK_MUTATION } from './AddBookButton';

    const mocks = [
      {
        request: {
          query: ADD_BOOK_MUTATION,
          variables: {
            title: 'The Shining',
            author: 'Steven King',
          },
        },
        newData: jest.fn(() => ({
          data: {
            addBook: {
              id: '2',
              title: 'The Shining',
              author: 'Steven King',
            },
          },
        })),
      },
    ]

    test('mutation should be called when clicking the button', async () => {
      const { findByText } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddBookButton />
        </MockedProvider>
      );

      const addBookButton = await findByText('Add book');
      fireEvent.click(addBookButton);

      const addBookMutationMock = mocks[0].newData;
      await wait(() => expect(addBookMutationMock).toHaveBeenCalled());
    });


As you can see we assign a mock function to the `newData` field. It returns a book object corresponding to the variables inside the accompanying request. Inside the test, we find the button and click it. Then we simply wait for the `newData` mock function to be called.

## Summary

That's it! We found a neat and simple way to test if a mutation was called. You could do the same for queries. But as mentioned, in most situations it makes more sense to just check if the desired data was rendered into the DOM.

I hope this short post was helpful and you enjoyed reading. If you like subscribe to my list or share this with your friends.
