# Pointing Poker

## TL;DR
Create a real-time pointing poker app that can be used in Google Meet/web and can get info from GitHub Issues/Projects.

## Description

Pointing poker is a great exercise for estimating how complex an issue will be to work on. Currently, we rely on sites like, https://www.pointingpoker.com, however they aren't always running smoothly/operational which leads to delays. This can be a simple application that runs on Shopify infrastructure we can have better guarantees that it will function well, and we can build features to seamlessly connect to the GitHub Issues that we are pointing thus increasing everyone's context on what is being pointed as well as makes running the exercise simpler.

## Brief

- Real-time Application
- Simple "room codes" that people can use to join
- Leverage the new Google Meet apps to easily make an activity for everyone to join.
- Connect to GitHub Issues/Projects to grab useful info like issue title, description, and link. As well as be able to set the points on the issue once there is agreement.


[Tech Design](https://docs.google.com/document/d/1QHgXuBD17h7q5Dl8IBD8w95I_k_12fmQ9NsPIsutl0k/edit#heading=h.iz5ju0bktp11)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

## Using Pointing Poker

Live build [here](https://pointing-poker-iota.vercel.app)

- [Firebase users](https://console.firebase.google.com/project/shopifolk-pointing-poker/authentication/users)
- [Firestore database](https://console.firebase.google.com/project/shopifolk-pointing-poker/firestore)
