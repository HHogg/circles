<p align="center">
  <img src="./site/assets/circles.svg" />
</p>

<h2 align="center" style="margin: 0">Circles</h2>
<h5 align="center"  style="margin: 0"><a href="https://circles.hogg.io">https://circles.hogg.io</a></h5>

<p align="center"  style="margin-top: 30px">
  A tool for creating artwork by filling in the intersection areas of overlapping
  circles. Inspired by a <a href="https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles">Reddit post</a> and <a href="http://dorotapankowska.com/13-animals-13-circles.html">13 Animals Made From 13 Circles</a> by Dorota Pankowska.
</p>

<p align="center">
  This was also an experiment to try out a new way of calculating all of the intersections areas with little geometry. If you're interested in reading more about this, <a href="https://hogg.io/writings/circle-intersections">you can read about it on my website</a>.
</p>


### Technology

- [Typescript](https://www.typescriptlang.org/)
- [Parcel](https://parceljs.org/) (bundler and dev servers)
- [React](https://reactjs.org/)
- [PostCSS](https://postcss.org/) (with postcss-preset-env for a little power)
- [Two](https://two.js.org/) (2d drawing)
- [Firebase](https://firebase.google.com/) (hosting)


### Setup

##### Prerequisites

• [Node](https://nodejs.org/en/) - Either use [nvm use](https://github.com/nvm-sh/nvm) or checkout the tested version inside the [.nvmrc](./nmvrc) file.

##### Setup

Clone the repository

```
git clone git@github.com:HHogg/circles.git
```

Install the dependencies with your favourite package manager

```
yarn install
```

##### Running

Spin up the Parcel development server

```
yarn start
```

##### Building

Build the static files using Parcel

```
yarn build
```

##### Deploying

Deploy to Firebase hosting (... after authenticating)

```
yarn deploy
```



