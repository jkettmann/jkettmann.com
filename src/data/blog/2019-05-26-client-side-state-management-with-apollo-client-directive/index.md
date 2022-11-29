---
category: 'blog'
title: Client-side state management with the Apollo client directive
slug: client-side-state-management-with-apollo-client-directive
date: 2019-05-26
tags: ['local state', '@client directive']
published: true
---

Why should I use yet another tool for managing local state when I already use Apollo and GraphQL? Unfortunately handling client-side state using the `@client` is still a mystery for many. The otherwise great Apollo docs are unclear in this regard and debugging can be very frustrating if you get something wrong.

When you get it right though Apollo can be really nice to use for client state. You will be rewarded with a consistent code base. Therefore let's have a look at local state management with Apollo in this article.

We will implement a modal overlay opened by a button as a simple use-case for client-side state with Apollo. Afterward we will implement a shopping cart that holds a list of products as a more advanced example.

You can find the complete source code including instructions how to run it [here](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive).

If you're still indecisive whether you should use Apollo at all checkout the [comparison of Redux + REST and Apollo + GraphQL](https://jkettmann.com/how-to-authenticate-using-graphql-and-jwt/). If you're looking to combine server-side data with local state, [this post](https://jkettmann.com/combining-server-side-data-and-local-state-with-apollo-client-directive/) might be interesting for you as well.

## Setting and fetching a client-side flag

First we will implement a button that opens a modal window. This is a simple use-case for local state where we just need to set a boolean flag.

### Implementing a client-side mutation

We start with the entry point for our application, the App component. It initializes the Apollo client with a `resolvers` object to use local state. Then it simply renders a button inside the Apollo provider which we will later use to open the modal.

    import React from 'react';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from 'react-apollo';
    import resolvers from './resolvers';
    import OpenModalButton from '../OpenModalButton';

    const client = new ApolloClient({
      resolvers,
    });

    const App = () => (
      <ApolloProvider client={client}>
        <div className='App'>
          <OpenModalButton />
        </div>
      </ApolloProvider>
    );

The `resolvers` object should contain the mutation to open the modal. Local mutations are defined the same way as on the server-side. The third argument is different though and gives us access to the client-side cache. We use this inside the `openModalMutation` to set the `isModalOpen` flag to `true` by using the cache's `writeData` function. We're not interested in a return value, so the mutation can return `null`.

    const resolvers = {
      Mutation: {
        openModalMutation: (_, args, { cache }) => {
          cache.writeData({ data: { isModalOpen: true }});
          return null;
        },
      },
    };

In order to initialize the local cache we can use the same `writeData` function to write an initial data set as soon as the app is loaded.

    const client = new ApolloClient({
      resolvers,
    });

    client.cache.writeData({
      data: {
        isModalOpen: false,
      }
    });

    const App = () => ( ... );

Now we only need to execute the mutation from the UI. Below we define the `OpenModalButton` component. It simply wraps a `button` in a Apollo mutation. We need to set the `@client` directive on the `openModalMutation` to indicate to the Apollo client that this mutation is targeting local state. Since we're not interested in a return value we don't add any fields to the mutation.

    import React from 'react';
    import { Mutation } from 'react-apollo';
    import gql from 'graphql-tag';

    const OPEN_MODAL_MUTATION = gql`
      mutation {
        openModalMutation @client
      }
    `;

    const OpenModalButton = () => (
      <Mutation mutation={OPEN_MODAL_MUTATION}>
        {
          (openModal) => (
            <button onClick={openModal}>
              Open modal
            </button>
          )
        }
      </Mutation>
    );

[To see all changes click here](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive/compare/step-0...step-1). When you run the app at this stage you won't see anything for now. But you can add a breakpoint to the mutation in `resolvers` or look at the Apollo dev tools when clicking the button.

### Fetching client-side state

We can set the `isModalOpen` flag in the client-side state now, but we yet have to consume it by displaying the modal. Thus we need to add a `Modal` component to the `App`.

    import Modal from '../Modal';

    ...

    const App = () => (
      <ApolloProvider client={client}>
        ...
        <Modal />
      </ApolloProvider>
    );

The `Modal` component wraps its content in a Apollo `Query`. Inside the query we ask for the `isModalOpen` flag and again use the `@client` directive to indicate that this is local state. We only render the `ModalContent` component when the flag is set.

    import React from 'react';
    import { Query } from 'react-apollo';
    import gql from 'graphql-tag';
    import ModalContent from './ModalContent';

    const MODAL_QUERY = gql`
      query {
        isModalOpen @client
      }
    `;

    const Modal = () => (
      <Query query={MODAL_QUERY}>
        {
          ({ data }) => data.isModalOpen && (
            <ModalContent />
          )
        }
      </Query>
    );

The `ModalContent` component simply renders a text into a fullscreen overlay.

    import React from 'react';

    const ModalContent = () => (
      <div className='Modal'>
        <h2>This is a modal!</h2>
      </div>
    );

[Click here to see all changes](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive/compare/step-1...step-2). If you like you can try to implement a button and mutation to close the modal again as a small challenge. [When you're done you can find the necessary changes here](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive/compare/step-2...step-3).

## Managing more complex client-side state

This was a fairly simple example where we only set a client-side boolean flag. But what if you need more complex data that also changes existing local state.

### Updating the cache using the writeQuery function

We will continue here with a local shopping cart example where we can add random products by clicking a button. Let's add an array called `selectedProducts` to the client state. This will initially be emtpy. So first we add it to the initial data set.

    const client = new ApolloClient( ... );

    client.cache.writeData({
      data: {
        isModalOpen: false,
        selectedProducts: [],
      }
    });

    const App = () => ( ... );

Now we need to implement the mutation to add items to the `selectedProducts` array. The `addProductToCart` mutation uses the cache's `writeQuery` function to initialize the array with the newly selected product. It's important to set the `__typename` field here, because Apollo uses it to create its unique cache id. We will use the same `query` to read the currently selected products from the cache later.

    import gql from 'graphql-tag';

    const resolvers = {
      Mutation: {
        ...
        addProductToCart: (_, { id, title, price }, { cache }) => {
          const query = gql`
            query ProductsInCart {
              selectedProducts @client {
                id
                title
                price
              }
            }
          `;

          const product = { id, title, price, __typename: 'Product' };
          const data = { selectedProducts: [product] };
          cache.writeQuery({ query, data });
          return null;
        },
      },
    };

> Note: When using `writeQuery` it's important to set the `__typename` field, because Apollo uses it to create its unique cache id.

Now we define the button component that triggers the mutation. The `ADD_PRODUCT_TO_CART_MUTATION` invokes the `addProductToCart` resolver and passes it the product's `id`, `title` and `price`. These are randomly generated using the [faker](https://github.com/Marak/Faker.js) package.

    import React from 'react';
    import { Mutation } from 'react-apollo';
    import gql from 'graphql-tag';
    import faker from 'faker';

    const ADD_PRODUCT_TO_CART_MUTATION = gql`
      mutation addProductToCart($id: String!, $title: String!, $price: String!) {
        addProductToCart(id: $id, title: $title, price: $price) @client
      }
    `;

    const getRandomProduct = () => ({
      id: faker.random.uuid(),
      title: faker.commerce.productName(),
      price: `${faker.commerce.price()}$`,
    });

    const AddProductToCartButton = () => (
      <Mutation mutation={ADD_BOOK_MUTATION}>
        {
          addProductToCart => (
            <button onClick={() => addProductToCart({ variables: getRandomProduct() })}>
              Add a product
            </button>
          )
        }
      </Mutation>
    );

And finally we add above button component to the `App`.

    const App = () => (
      <ApolloProvider client={client}>
        <div className='App'>
          <AddProductToCartButton />
          <OpenModalButton />
        </div>
        <Modal />
      </ApolloProvider>
    );

[See this diff for all changes](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive/compare/step-3...step-4). Nothing will happen yet in the UI though, so come back atferwards and follow me into the next section.

### Rendering the client-side state

To see the actual changes to our local state let's impelement the shopping cart rendering the selected products. The `ShoppingCart` component renders all items in `selectedProducts` into an Apollo `Query` component. The query uses again the `@client` directive on the `selectedProducts` field.

    import React from 'react';
    import { Query } from 'react-apollo';
    import gql from 'graphql-tag';
    import Product from '../Product';

    const SELECTED_PRODUCTS_QUERY = gql`
      query {
        selectedProducts @client {
          id
          title
          price
        }
      }
    `;

    const ShoppingCart = () => (
      <Query query={SELECTED_PRODUCTS_QUERY}>
        {
          ({ data }) => (
            <React.Fragment>
              <p>
                Shopping cart
              </p>

              {data.selectedProducts.map(product => (
                <Product key={product.id} {...product} />
              ))}
            </React.Fragment>
          )
        }
      </Query>
    );

The product component simply renders the product's title and price.

    import React from 'react';

    const Product = ({ title, price }) => (
      <p>
        {title} for {price}
      </p>
    );

We now only need to add `ShoppingCart` to our `App`.

    const App = () => (
      <ApolloProvider client={client}>
        <div className='App'>
          <ShoppingCart />
          <AddProductToCartButton />
          <OpenModalButton />
        </div>
        <Modal />
      </ApolloProvider>
    );

And voila! Run the [code in this commit](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive/compare/step-4...step-5) and you will see one product in the UI changing with every click on the button.

### Updating existing client-side state

Currently, you will still see only a single product in the list even when you click the button twice. The goal is of course not to replace the existing product with the newly selected one. Rather we'd like to append it to the array of previously selected products. To achieve this we need to adjust the mutation's implemenation inside `clientState`. As promised we now use the `query` we already defined and the cache's `readQuery` function to get the previously selected products. We than concatinate it with the newly added product. Again we need to set the `__typename` field so Apollo can identify the product in the cache. As before we use the `writeQuery` function to update the cache with the newly created `selectedProducts` array.

    const resolvers = {
      Mutation: {
        ...
        addProductToCart: (_, { id, title, price }, { cache }) => {
          const query = gql`
            query ProductsInCart {
              selectedProducts @client {
                id
                title
                price
              }
            }
          `;

          const previous = cache.readQuery({ query });
          const selectedProducts = previous.selectedProducts.concat({
            id,
            title,
            price,
            __typename: 'Product',
          });
          const data = { selectedProducts };

          cache.writeQuery({ query, data });
          return null;
        },
      },
    };

You can now checkout and run the [latest version](https://github.com/jkettmann/client-side-state-handling-with-apollo-client-directive). You should see a new random item in the shopping cart every time you click the `Add product button`.

## Summary

In this post we saw how to use client-side state with Apollo. First we implemented a simple modal overlay setting a boolean flag with the cache's `writeData` function. Then we updated an array of products displayed in a "shopping cart" using the cache's `readQuery` and `writeQuery` functions.

We only had a look at purely local state here. In a follow-up post we will learn how to combine server-side data with client-side state.

import Newsletter from 'components/Newsletter'

<Newsletter formId="ZBGZ4J"/>
