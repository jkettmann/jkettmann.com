---
category: 'blog'
title: How to authenticate using GraphQL and JWT
slug: how-to-authenticate-using-graphql-and-jwt
date: 2019-01-28
tags: ["Authentication"]
published: true
---

-
How can I set a JWT token to a cookie using GraphQL?

-
Do I need to put the authentication logic into every resolver?

Maybe you are wondering how to authenticate your users when you build a GraphQL backend using JSON web token (JWT). If so your answer may be: Use a *session middleware* in combination with the *GraphQL context*.

The goal of this post is to show how to

- set a JWT to the user browser's cookies from a GraphQL mutation in order to track a session
- authenticate a logged in user in GraphQL resolvers

You can find the final code including instructions on how to run it inside [this repository](https://github.com/jkettmann/authentication-with-graphql-and-jwt). This is just a simple Apollo server, so there is no frontend included. You can use the GraphQL playground at [localhost:4000/graphql](http://localhost:4000/graphql) to test the queries and mutations described in this post.

Now let's start!

## The login mutation

We would like a user to be able to login into our app. First of all, let's start with the login mutation. We define the Query, Mutation and User GraphQL types.

    const typeDefs = gql`
      type User {
        firstName: String
        lastName: String
        email: String
      }

      type Query {
        currentUser: User
      }

      type Mutation {
        login(email: String!, password: String!): User
      }
    `;


The login mutation expects an email and password as parameters. These are used in the login resolver below to identify the corresponding user.

    const users = [
      {
        id: '1',
        firstName: 'Maurice',
        lastName: 'Moss',
        email: 'maurice@moss.com',
        password: 'abcdefg',
      },
      {
        id: '2',
        firstName: 'Jen',
        lastName: 'Barber',
        email: 'jen@barber.com',
        password: 'qwerty',
      },
      {
        id: '3',
        firstName: 'Roy',
        lastName: 'Trenneman',
        email: 'roy@trenneman.com',
        password: 'imroy',
      },
    ];

    const resolvers = {
      Mutation: {
        login: (obj, args, context) => {
          const { email, password } = args;
          return users.find(user => user.password === password && user.email === email);
        },
      },
    };


The login mutation resolver is for now simply returning the user matching the given email and password.

If you want to go along you can checkout [this commit](https://github.com/jkettmann/authentication-with-graphql-and-jwt/commit/03031440ac0239cbbfeef1399f5014362442c919) and send following mutation to the server by navigating to [the GraphQL playground](http://localhost:4000/graphql). You should receive the corresponding first and last name.

    mutation {
      login(email: "jen@barber.com", password: "qwerty") {
        firstName
        lastName
      }
    }


The next step should be to implement the `currentUser` resolver. But as you can see below we have no way to identify the user that has just logged in.

    const resolvers = {
      Query: {
        currentUser: (obj, args, context) => users.find(user => user.id === ??),
      },
      Mutation: {...},
      },
    };


How should we find that user? Since we didn't save the user ID anywhere yet, we don't know how to identify the person that previously logged in. How to solve this?

## The session middleware

We first need a place where we can store the ID of a user that logs in. We will create a `Session` class which saves the user data to the request.

    class Session {
      constructor(request, response) {
        this.request = request;
        this.response = response;
      }

      update(user) {
        if (!user) {
          return;
        }

        const cookieOptions = {
          httpOnly: true,
          // use secure flag in production to send only via encrypted connections
          // secure: true,
        };
        this.response.cookie('userId', user.id, cookieOptions);
      }
    }


When it's constructed the session stores the request and response so we can access their cookies later. We added an update function which sets the user's ID to a cookie.

Now we implement a `session middleware` to create a new session for each request.

    const sessionMiddleware = (request, response, next) => {
      request.session = new Session(request, response);
      next();
    };


We use this session middleware on the express server.

    const app = express();
    app.use(cookieParser());
    app.use(sessionMiddleware);


The next question is how to call the session's update function from the login mutation.

## Setting the session to the GraphQL context

In order to be able to access the session from the GraphQL resolvers, we need to set it to the GraphQL context.

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        session: req.session,
      }),
      playground: {
        settings: {
          // include cookies in the requests from the GraphQL playground
          'request.credentials': 'include',
        },
      },
    });


Inside the resolvers, we can now call the session's update function.

    const resolvers = {
      ...
      Mutation: {
        login: (obj, args, context) => {
          const { email, password } = args;
          const matchingUser = users.find(user => user.password === password && user.email === email);
          context.session.update(matchingUser);
          return matchingUser;
        },
      },
    };


Checkout [this commit](https://github.com/jkettmann/authentication-with-graphql-and-jwt/commit/9f7d6a4d2104b2ed6b84dd855c8e321c323a2297), open the development tools in the GraphQL playground and run the same login mutation again. You should be able to see a cookie called `userId` with the correct value.

The goal of allowing a user to log in is, of course, to show them restricted data on subsequent requests. In this post, we will use the `currentUser` field for that purpose.

## Writing a resolver that delivers restricted data

The user ID is now saved inside a cookie. But to access it inside a resolver we need to set it in the session as well.

    class Session {
      constructor(request, response) {
        this.request = request;
        this.response = response;
        this.userId = request.cookies.userId;
      }

      ...
    }


Now we can write the resolver for the current user. This will get the user ID from the session and return the corresponding user.

    const resolvers = {
      Query: {
        currentUser: (obj, args, context) => users.find(user => context.session.userId === user.id),
      },
      Mutation: {
        ...
      }
    };


To try this you can checkout [this commit](https://github.com/jkettmann/authentication-with-graphql-and-jwt/commit/b76df161eb6d670961a05deef88db008867c3b3f) and send the following query. If you have send a login mutation before you should see the corresponding user data on this query as well. If the user ID cookie is not set the current user should be `null`.

    query {
      currentUser {
        firstName
      }
    }


Great! We are actually able to log in a user and track her on subsequent requests. With this implementation, we introduced a security risk though. Just try to set a different user ID in the cookie. Without knowing the user's password you will have access to their data. So how can we secure the cookie?

## Use JWT to store session information

In order to secure the cookies, we use JSON web token. These token are signed and decoded with a secret. If an attacker tries to change data inside the token without knowing the secret, the decoding will fail. The attacker won't have access to restricted data.

    import jwt from 'jsonwebtoken';

    const TOKEN_SECRET = 'some-token-secret';

    class Session {
      constructor(request, response) {
        this.request = request;
        this.response = response;
        this.userId = null;

        const { sessionToken } = request.cookies;
        this.initFromToken(sessionToken);
      }

      initFromToken(sessionToken) {
        if (!sessionToken) {
          return;
        }

        try {
          const { userId } = jwt.verify(sessionToken, TOKEN_SECRET);
          this.userId = userId;
        } catch (error) {
          console.error('Error decoding session token', error);
        }
      }

      update(user) {
        if (!user) {
          return;
        }

        this.userId = user.id;

        const sessionToken = jwt.sign(
          { userId: user.id },
          TOKEN_SECRET,
          // A session should not last for 1 year in production environments
          { expiresIn: '1y' },
        );
        const cookieOptions = {
          httpOnly: true,
          // use secure flag in production to send only via encrypted connections
          // secure: true,
        };
        this.response.cookie('sessionToken', sessionToken, cookieOptions);
      }
    }


Inside the update function, we create a JWT containing the user's ID. This token is then set to the response cookies. On every subsequent request, the token will be decoded. If the token is valid we extract the user ID and set it to the session. This way the user ID is again available inside the GraphQL resolvers.

## Summary

Let's quickly recap: We created `login mutation` and a `current user query`. The login mutation updates a session and sets a `JWT session token` to the browser's `cookies`. On each subsequent request, this token is copied into the `Apollo Server`'s context and used to identify the currently logged in user.
