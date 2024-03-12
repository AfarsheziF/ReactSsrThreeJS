import 'babel-polyfill';
import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser'
import serialize from 'serialize-javascript';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import createEmotionServer from '@emotion/server/create-instance';

import template from './template';
import App from './app/app';
import theme from './theme';

import logger from './logs/logger';
// import serverUtils from './utils/serverUtils';
import dataController from './store/dataController';
import sessionController from './store/sessionController';
import config from './config/config';
import appConfig from './config/appConfig';

const app = express();
const port = process.env.PORT || 62098;

const rootDir = path.resolve('./');
console.log("Root:", rootDir)
global.hostState = process.env.NODE_ENV || 'production';
global.__DEV__ = process.env.NODE_ENV === "development";
global.basePrefix = process.env.NODE_ENV === "development" ? "" : appConfig.name;
global.baseUrl = process.env.NODE_ENV === "development" ? rootDir : "https://orsarfat.uber.space/" + global.basePrefix;
global.rootDir = process.env.NODE_ENV === "development" ? rootDir : "home/orsarfat/bin/" + global.basePrefix;
process.env.sendErrorEmails = "true";

app.use(cors({ origin: 'https://localhost:' + port }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// static
app.use('/public', express.static(global.baseUrl + '/public'));

// requests
app.use('/data', function (req, res, next) {
  config.loadAssets().then(
    data => res.status(200).send(data),
    e => {
      res.status(503);
      next();
    }
  )
});

// app.use('/backups', function (req, res, next) {
//   let data = require('./config/siteParams').default;
//   res.status(200);
//   res.send(data.backups);
// });
app.post('/appConfig', function (req, res, next) {
  if (__DEV__ || req.body.session && sessionController.validateSession(req.body.session)) {
    let appConfig_backup = require('./config/appConfig_backup.json');
    res.status(200);
    res.send(JSON.stringify({
      appConfig: appConfig,
      appConfig_backup: appConfig_backup
    }));
  } else {
    logger.log('Session is missing or invalid: ' + req.body.session);
    res.status(403);
    next(new Error('Invalid session token'));
  }
});

app.post('/validatePass', function (req, res, next) {
  if (req.body && req.body.value) {
    if (req.body.value.toLowerCase() === appConfig.adminPassword.toLowerCase()) {
      res.status(200);
      res.send({ loggedIn: true, session: sessionController.generateSession() });
    } else {
      res.status(401);
      res.send({ error: 'Password does not match' });
    }
  } else {
    res.status(403);
    next(new Error('No file found'));
  }
});

app.use('/test', function (req, res, next) {
  res.status(200).json({
    status: 'Active',
    name: appConfig.name,
    host: global.baseUrl + ":" + port,
    state: global.hostState,
    baseURL: global.baseUrl,
    basePrefix: global.basePrefix,
    rootDir: global.rootDir,
    sendErrorEmails: true
  })
});


dataController.addFileRoute('/uploadFile', app);

function handleRender(req, res) {
  const cache = createCache({ key: 'css' });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);
  const context = {};

  // Render the component to a string.
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <StaticRouter location={req.url} context={context}>
        <CacheProvider value={cache}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <App />
          </ThemeProvider>
        </CacheProvider>
      </StaticRouter>
    </React.StrictMode>
  );

  // Grab the CSS from emotion
  const emotionChunks = extractCriticalToChunks(html);
  const emotionCss = constructStyleTagsFromChunks(emotionChunks);

  // Send the rendered page back to the client.
  res.send(
    template(
      html,
      emotionCss,
      appConfig,
      serialize({
        baseUrl: global.baseUrl,
        basePrefix: global.basePrefix
      },
        { isJSON: true }
      )
    )
  );
}

// This is fired every time the server-side receives a request.
app.use(handleRender);

console.log('> Starting serer <');
app.listen(port, () => {
  logger.init(
    appConfig.name,
    appConfig.emailsReceiverAddress || 'afrshezif@gmail.com',
    appConfig.emailSubject || appConfig.name,
    global.hostState
  ).then(
    function () {
      logger.log(">--- Server Stared ---< ");
      logger.log(`Listening on ${port}`);
      logger.log(`BaseUrl: ${global.baseUrl}`);
      logger.log(`State: ${global.hostState}`);

      dataController.clearStorageDirectory();
      // config.init();

    },
    function (e) {
      console.error(e);
    }
  )
});