---
category: 'blog'
title: Authentication and Authorization with GraphQL and Passport
slug: authentication-and-authorization-with-graphql-and-passport
date: 2019-05-29
tags: ["Authentication", "Authorization", "Passport", "Series"]
published: true
---

Authentication and authorization can be a challenging topic. Especially with GraphQL as a pretty young technology, there seems to be a lot of uncertainty and confusion.

- Should you use a library like Passport.js which is established? But how would you integrate that with GraphQL?
- Should you rather use separate endpoints for authentication? But wouldn't it be better and more concise to have auth requests like login and signup go through the GraphQL layer as well?

Since I also experienced the same confusion and made mistakes in the implementation I would like to share my knowledge in this series of articles. We will shine a light on how to implement authentication with social identity providers such as Facebook,  as well as password-based login and signup with GraphQL. While we will integrate all of this in GraphQL we will leverage the power of established libraries like Passport.js.

## Articles of this series on authentication

[Preparing a GraphQL server for authentication (on this page)](#initializingtheproject)

[Password-based authentication with GraphQL and Passport](https://jkettmann.com/password-based-authentication-with-graphql-and-passport/)

[Facebook login with GraphQL and Passport](https://jkettmann.com/facebook-login-with-graphql-and-passport/)

[Implementing a React app authenticating via the GraphQL API](https://jkettmann.com/authentication-with-graphql-and-passport-js-the-frontend/)

[3 ways for authorization with GraphQL and Apollo](https://jkettmann.com/3-ways-for-authorization-with-graphql-and-apollo/)

[Authorization with GraphQL and custom directives](https://jkettmann.com/authorization-with-graphql-and-custom-directives/)

In order to keep the articles short and concise, we will do the preparation work in this post. We will implement a GraphQL server that supports a dummy `logout` mutation as well as a dummy `currentUser` field in the query. The server will already use `passport` together with `express-session` for persistent user sessions.

After reading this post you should be able to follow any of the articles on server-side authentication with GraphQL and passport which are part of this series. You can of course also skip this part and return later if anything is unclear. If you're only interested in the complete code check [this GitHub repository](https://github.com/jkettmann/authentication-with-graphql-passport-and-react-starter).

## Initializing the project

Since we want to write a small React app later on to connect to the GraphQL API we will initialize the repository with [create-react-app](https://facebook.github.io/create-react-app/).

    npx create-react-app authentication-with-graphql-and-passport


The `src` folder contains the React app which we will leave untouched for now. We will need a few additional packages to implement and start the server.

- `express` to write the server
- `nodemon` to automatically restart the server when we edit files
- `babel-node` mainly to use `import` syntax in our code

    npm install express nodemon
    npm install --save-dev @babel/node


Additionally, we need to add a new script to `package.json` to start the server.

    "scripts": {
      ...
      "start": "npm run start:api",
      "start:app": "react-scripts start",
      "start:api": "nodemon --watch ./api --exec \"babel-node --inspect --presets=@babel/env ./api/index.js\"",
      ...
    }


Now create a new folder called `api` with an `index.js` file in it. This file should contain our entry point for the server. For now, this is a simple express app which listens to a given port `4000`. You can run the server with `npm start` but it won't do much yet.

    import express from 'express';

    const PORT = 4000;

    const app = express();

    app.listen({ port: PORT }, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
    });


## Setting up express-session for persisting user sessions

[express-session](https://github.com/expressjs/session) is a library that manages user sessions for you. It provides the functionality to save session data in a storage that you choose. You can provide ready-made stores using different libraries like [connect-redis](https://github.com/tj/connect-redis). By default, it uses an in-memory store. To make the session persistent throughout recurring requests an identifier is saved inside a cookie.

First of all, we need to install the new dependencies. Additionally to `express-session` we will use `uuid` to create the above-mentioned session identifier.

    npm install express-session uuid


There are basically two things we need to do to set up `express-session`. First, we initialize the session middleware in `api/index.js`.

    import session from 'express-session';
    import uuid from 'uuid/v4';

    ...

    const SESSION_SECRECT = 'bad secret';

    const app = express();

    app.use(session({
      genid: (req) => uuid(),
      secret: SESSION_SECRECT,
      resave: false,
      saveUninitialized: false,
    }));

    app.listen( ... );


As mentioned we use `uuid` here to generate a session ID. A secret is needed to sign the cookie. The default values for `resave` and `saveUninitialized` have been deprecated so we set them here to be save. Refer to the documentation for more information.

**Important note:** For a production environment you would need to adjust a couple of things here.

- for ease of implementation we hard-coded the secret, but taking it from environment variables would be the way to go for a production environment
- you would want to set the cookie to `secure` mode so that it is only sent via https. You can use the `cookie` option for this: `cookie: { secure: true }`
- we use the default in-memory store by not setting the `store` option. This means that all sessions will be deleted when we restart the server. Since we use nodemon this will also happen when you edit files. So don't scratch your head too much when you're suddenly not logged in anymore.

## Adding a dummy database model

Since we want to focus on the authentication in these tutorials we won't use a real database. That's why we create a list of mock users and a dummy database model to a new file called `api/User.js`. We define functions for getting all users and adding a new user to support the signup and login functionality.

    const users = [
      {
        id: '1',
        firstName: 'Maurice',
        lastName: 'Moss',
        email: 'maurice@moss.com',
        password: 'abcdefg'
      },
      {
        id: '2',
        firstName: 'Roy',
        lastName: 'Trenneman',
        email: 'roy@trenneman.com',
        password: 'imroy'
      }
    ];

    export default {
      getUsers: () => users,
      addUser: (user) => users.push(user),
    };


## Setting up Passport

[Passport.js](https://github.com/jaredhanson/passport) is a library that handles user authentication for you. There are loads of plugins (called strategies) to authenticate using different identity providers like [Facebook](https://github.com/jaredhanson/passport-facebook), [Twitter](https://github.com/jaredhanson/passport-twitter), [Auth0](https://github.com/auth0/passport-auth0) or your own database.

Passport is made for classical express apps so it can be a bit confusing to figure out how to use it together with GraphQL especially if you want to have mutations to signup and login against credentials saved in your own database.

For now, this is not a problem though. We can use the same approach to set up Passport as in any other app. First, we need to install the package.

    npm install passport


First, we tell Passport what user data to save inside the session and how to get the complete user back again on subsequent requests. Here we save the user's ID to the session by using Passport's `serializeUser` function and get its data back by searching all users by ID in `deserializeUser`. Open `api/index.js` and add the following lines.

    import passport from 'passport';
    import User from './User';

    ...

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      const users = User.getUsers();
      const matchingUser = users.find(user => user.id === id);
      done(null, matchingUser);
    });

    const app = express();
    ...



The last missing piece is to initialize the Passport middleware and make it aware of using `express-session`. Again in `api/index.js` we need to add the following lines.

    import passport from 'passport';

    ...

    const app = express();

    app.use(session( ... ));

    app.use(passport.initialize());
    app.use(passport.session());

    app.listen( ... );


After setting the `express-session` middleware we initialize passport by calling `passport.initialize()`. Afterward we connect Passport and express-session by adding the `passport.session()` middleware.

## Preparing a GraphQL server for authentication

Last but not least we will create a GraphQL server that allows us to read the current user's data after login as well as logout from a user session. This is all we need for social logins for example via Facebook or Twitter. For password-based authentication, we would need to add functionality for signup and login which we will handle in another post.

Let's start with the implementation inside the server's entry point in `api/index.js`. Since we already use the express-session and Passport middlewares we need to install `apollo-server-express` instead of `apollo-server`.

    import { ApolloServer } from 'apollo-server-express';
    import typeDefs from './typeDefs';
    import resolvers from './resolvers';

    ...

    const app = express();

    ...

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        getUser: () => req.user,
        logout: () => req.logout(),
      }),
    });

    server.applyMiddleware({ app });

    app.listen( ... );


We initialize the Apollo server with type definitions and resolvers we will define in a bit. Additionally, we pass the `user` object and `logout` function which are added to the request by Passport down to the context. We will use these in our resolvers later on.

**Note**: We explicitly define `context.logout` as an arrow function since Passport uses `this` internally. Thus we need to use a bound function here.

Instead of creating the context manually we could also use [graphql-passport](https://github.com/jkettmann/graphql-passport). It provides a `buildContext` function useful fields from the request to the context and allows us to access Passport functionality for authentication from within the resolvers. For now, it's overkill but we will introduce this package when we implement the password based login.

Let's continue with writing the GraphQL type definitions for the user type, the current user query field, and the logout mutation. Create a new file `api/typeDefs.js` and add the following code.

    import { gql } from 'apollo-server-express';

    const typeDefs = gql`
      type User {
        id: ID
        firstName: String
        lastName: String
        email: String
      }

      type Query {
        currentUser: User
      }

      type Mutation {
        logout: Boolean
      }
    `;

    export default typeDefs;


The return type for the logout mutation doesn't really matter here since we will return `null` anyways (either the request succeeds which means the logout was successful or both fail). But we need to provide some return type otherwise we will get an error when we start the server.

The resolvers matching above type definitions will simply make use of the `user` and `logout` fields on the context. Create a new file `resolvers.js` and add the following code.

    const resolvers = {
      Query: {
        currentUser: (parent, args, context) => context.getUser(),
      },
      Mutation: {
        logout: (parent, args, context) => context.logout(),
      },
    };

    export default resolvers;


We're done! By now you should have a working express server which provides a GraphQL API and is all set up for authentication with Passport. You can start the server by running the following command.

    npm start


You can point your browser to [localhost:4000/graphql](http://localhost:4000/graphql) and see the Apollo server playground. Here you can run the logout mutation and current user query.

    mutation {
      logout
    }


    query {
      currentUser {
        id
        firstName
        lastName
        email
      }
    }


The result for both will be `null` for now since we didn't implement a login yet. We will change that in the next articles where we will implement [password based login with GraphQL](https://jkettmann.com/password-based-authentication-with-graphql-and-passport/) and [login with Facebook](https://jkettmann.com/facebook-login-with-graphql-and-passport/).

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>