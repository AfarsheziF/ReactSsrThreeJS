const template = (content, css, appConfig, params) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
            <base href=${process.env.NODE_ENV === `development` ? `` : `"https://orsarfat.uber.space/${appConfig.name}/"`}/>

            <title>${appConfig.title} ${process.env.NODE_ENV === `development` ? '[DEV]' : ''}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            
            ${appConfig.noCache ? ` 
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta http-equiv="Pragma" content="no-cache" />
            <meta http-equiv="Expires" content="0" />
            ` : ``}
            
            <meta charset="utf-8" />
            <meta name="theme-color" content="#000000" />
      
            <!-- Fonts to support Material Design -->
            <link href="https://fonts.googleapis.com/css?family=Titillium+Web&display=swap" rel="stylesheet">

            <link rel="stylesheet" href="public/${appConfig.name}.main.style.css" />
            <style id="jss-server-side">${css}</style>

            <!-- Icon -->
            <link rel="icon" type="image/x-icon" href="public/images/icon/favicon.ico">
            <link rel="icon" type="image/png" sizes="32x32" href="public/images/icon/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="96x96" href="public/images/icon/favicon-96x96.png">
            <link rel="icon" type="image/png" sizes="16x16" href="public/images/icon/favicon-16x16.png">
            <link rel="apple-touch-icon" sizes="57x57" href="public/images/icon/apple-icon-57x57.png">
            <link rel="apple-touch-icon" sizes="60x60" href="public/images/icon/apple-icon-60x60.png">
            <link rel="apple-touch-icon" sizes="72x72" href="public/images/icon/apple-icon-72x72.png">
            <link rel="apple-touch-icon" sizes="76x76" href="public/images/icon/apple-icon-76x76.png">
            <link rel="apple-touch-icon" sizes="114x114" href="public/images/icon/apple-icon-114x114.png">
            <link rel="apple-touch-icon" sizes="120x120" href="public/images/icon/apple-icon-120x120.png">
            <link rel="apple-touch-icon" sizes="144x144" href="public/images/icon/apple-icon-144x144.png">
            <link rel="apple-touch-icon" sizes="152x152" href="public/images/icon/apple-icon-152x152.png">
            <link rel="apple-touch-icon" sizes="180x180" href="public/images/icon/apple-icon-180x180.png">
            <link rel="icon" type="image/png" sizes="192x192"  href="public/images/icon/android-icon-192x192.png">
            <link rel="manifest" href="public/images/icon/manifest.json">
            <meta name="msapplication-TileColor" content="#000000">
            <meta name="msapplication-TileImage" content="public/images/icon/ms-icon-144x144.png">
            <meta name="theme-color" content="#000000">

            <!-- Meta Tags -->
            <meta name="fragment" content="!" />
            <meta property="og:title" content="${appConfig.title}" />
            <meta property="og:description" content="${appConfig.description}" />
            <meta property="og:image" content="${appConfig.ogImage}"/>

            <meta name="description" content="${appConfig.description}" />
            <meta property="og:url" content="http://${appConfig.domain}/" />
            <meta property="og:type" content="website">
            <meta property="og:description" content="${appConfig.description}">

            <meta property="twitter:domain" content="http://${appConfig.domain}/" >
            <meta property="twitter:url" content="http://${appConfig.domain}/" >
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${appConfig.title}" />
            <meta name="twitter:description" content="${appConfig.description}" />
            <meta name="twitter:image" content="${appConfig.iconUrl}" />
            <meta name="twitter:card" content="summary_large_image" />

            </head>
      
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <script src="public/libs/tween.umd.js"></script>
              <script src="public/libs/jquery.min.js"></script>
              <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
              
              ${process.env.NODE_ENV === `development` ? '<script src="public/libs/lil-gui@0.19.js"></script>' : ``}

              <script>
                window.envParams = ${params ? params : {}};
                window.__DEV__ = ${process.env.NODE_ENV === 'development'};

                window.onSpotifyIframeApiReady = (IFrameAPI) => {
                  window.IFrameAPI = IFrameAPI;
                };
              </script>

              <script async src="public/${appConfig.name}.client.bundle.js"></script>
              <div id="root">${content}</div>
            </body >
      
          </html >
  `;
}

export default template;