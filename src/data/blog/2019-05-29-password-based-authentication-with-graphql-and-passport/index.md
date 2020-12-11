---
category: 'blog'
title: Password-based authentication with GraphQL and Passport
slug: password-based-authentication-with-graphql-and-passport
date: 2019-05-29
tags: ["Authentication", "Passport"]
published: true
---

The standard approach when using Passport.js is to have separate endpoints on your server for signup and login. The front-end sends data from the corresponding forms to these dedicated endpoints. After successful authentication, the user is redirected to some URL. With GraphQL you would also need to update or refresh the cache by refetching the user data or sending a mutation to the server after the forms have been submitted successfully.

This doesn't feel very GraphQL like and introduces additional requests and overhead due to error handling. You would rather want to have one signup and one login mutation that handle all of this. Then you can send the credentials to the server, authenticate the user and update the client-side cache afterward within a normal GraphQL flow. This is what we're going to do here.

The code in this article is based on a GraphQL API server we implemented in a [previous introductory post](https://jkettmann.com/authentication-and-authorization-with-graphql-and-passport/). You don't need to read that post to follow this article. But if you have trouble understanding or want the bigger picture you can have a look there.

As a starting point, the server already supports the logout mutation and current user query. It's also set up to use [Passport](https://github.com/jaredhanson/passport) and [express-session](https://github.com/expressjs/session). You can find the [code on GitHub](https://github.com/jkettmann/authentication-with-graphql-passport-and-react-starter) and add the code snippets in this article as you follow along.

## Adding the GraphQL local strategy for Passport

Passport usually requires separate endpoints for authentication. Thus handling signup and login from within GraphQL resolvers is not supported out of the box. For this reason, I created a small npm module called [graphql-passport](https://github.com/jkettmann/graphql-passport). This allows us to access Passport functionality from the GraphQL context and provides us with a strategy to use with user credentials and a local database. Let's add it to our dependencies.

    npm install graphql-passport


First, we need to initialize Passport with this strategy in `api/index.js`.

    import express from 'express';
    import passport from 'passport';
    import { GraphQLLocalStrategy } from 'graphql-passport';

    passport.use(
      new GraphQLLocalStrategy((email, password, done) => {
        const users = User.getUsers();
        const matchingUser = users.find(user => email === user.email && password === user.password);
        const error = matchingUser ? null : new Error('no matching user');
        done(error, matchingUser);
      }),
    );

    const app = express();
    app.use(passport.initialize());

    ...


We use the mock database model to find a match for the provided email and password. If we find a match we pass the user to the `done` callback. Otherwise, we create an error and pass it to `done`.

## Preparing the GraphQL context

Before we go on and implement the mutations we need to prepare the GraphQL context to make certain Passport functions accessible from the resolvers. We can use graphql-passport's `buildContext` function for this purpose. The initialization of the Apollo server inside `api/index.js` now looks like this.

    import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';

    ...

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => buildContext({ req, res }),
    });

    ...


`buildContext` copies a couple of Passport related fields like its `authenticate` and `login` functions from the request into the context and makes them usable from the resolvers. If you're interested you can find [the source code here](https://github.com/jkettmann/graphql-passport/blob/master/src/buildContext.js).

## Implementing the login mutation

First, let's add the login mutation to the GraphQL type definitions. We require a user's `email` and `password` as input variables and return the matching user object on success. Add the following lines in `api/typeDefs.js`.

    const typeDefs = gql`
      ...

      type AuthPayload {
        user: User
      }

      type Mutation {
        login(email: String!, password: String!): AuthPayload
        ...
      }
    `;


Now we need to implement the corresponding resolver. Open `api/resolvers.js` and add the following lines.

    const resolvers = {
      ...
      Mutation: {
        login: async (parent, { email, password }, context) => {
          const { user } = await context.authenticate('graphql-local', { email, password });
          await context.login(user);
          return { user }
        },
        ...
      }
    };

    export default resolvers;


First, we call the `authenticate` function on the context. We pass it the name of the strategy we use (*graphql-local*) and the credentials which we can read from the mutation variables. In order to create a persistent user session Passport requires us to call the `login` function after authenticating.

Now we can run `npm start` to start the GraphQL server. Open your browser and point it to [localhost:4000/graphql](http://localhost:4000/graphql). When you run the login mutation should return the corresponding user object as defined in `User.js`.

    mutation {
      login(email: "maurice@moss.com", password: "abcdefg") {
        user {
          id
          firstName
          lastName
          email
        }
      }
    }


## Implementing the signup mutation

Finally, let's implement the signup mutation as well. We again start with the type definitions. This is fairly similar to the login mutation. We only expect the first and last name as additional variables.

    const typeDefs = gql`
      ...

      type Mutation {
        signup(firstName: String!, lastName: String!, email: String!, password: String!): AuthPayload
        ...
      }
    `;


Since we need to add the new user to the list of existing ones we will need to access the User model from the resolvers. Therefore we need to add it to the GraphQL context. We can achieve this by passing the User model to buildContext inside `api/index.js`.

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => buildContext({ req, res, User }),
    });


`buildContext` will add all additional fields you pass to it to the context.

Now we can head to `resolvers.js`. First, we need to check if a user with the provided email already exists. If not we add the user. Otherwise, we throw an error. We also want the user to be logged in directly after signing up. In order to create a persistent session and set the corresponding cookie, we need to call the `login` function here as well.

    import uuid from 'uuid/v4';

    const resolvers = {
      ...
      Mutation: {
        signup: (parent, { firstName, lastName, email, password }, context) => {
          const existingUsers = context.User.getUsers();
          const userWithEmailAlreadyExists = !!existingUsers.find(user => user.email === email);

          if (userWithEmailAlreadyExists) {
            throw new Error('User with email already exists');
          }

          const newUser = {
            id: uuid(),
            firstName,
            lastName,
            email,
            password,
          };

          context.User.addUser(newUser);

          await context.login(newUser);

          return { user: newUser };
        },
        ...
      },
    };

    export default resolvers;


When you run the server with `npm start` and open your browser at [localhost:4000/graphql](http://localhost:4000/graphql) you should be able to execute the signup mutation below.

    mutation {
      signup(
        firstName: "Jen",
        lastName: "Barber",
        email: "jen@barber.com",
        password: "qwerty"
      ) {
        user {
          id
          firstName
          lastName
          email
        }
      }
    }


You can execute the login mutation with the email and password you used in the signup mutation and see the newly created user as well. Be aware though that the new user will be gone once you restart the server (or in fact save a file in the `api` directory since we use nodemon).

The `currentUser` query below should return the same data when you send it after having logged in or signed up.

    {
      currentUser {
        id
        firstName
        lastName
        email
      }
    }


In the next post, we will learn [implement a social login using Facebook](https://jkettmann.com/facebook-login-with-graphql-and-passport/). The final code for this and the other articles from the series [can be found here](https://github.com/jkettmann/authentication-with-graphql-passport-and-react).

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>