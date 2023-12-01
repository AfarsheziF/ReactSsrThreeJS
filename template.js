const template = (content, css, appName, domain, title, description, iconUrl, params) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
            <base href=${process.env.NODE_ENV === "development" ? "/" : "https://orsarfat.uber.space/" + appName}>

            <title>${title} ${process.env.NODE_ENV ? '[DEV]' : ''}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta http-equiv="Pragma" content="no-cache" />
            <meta http-equiv="Expires" content="0" />
            <meta charset="utf-8" />
            <meta name="theme-color" content="#000000" />
      
            <!-- Fonts to support Material Design -->
            <link href="https://fonts.googleapis.com/css?family=Titillium+Web&display=swap" rel="stylesheet">

            <link rel="stylesheet" href="public/${appName}.main.style.css" />
            <style id="jss-server-side">${css}</style>
      
            <link rel="icon" type="image/gif" href="${iconUrl}" />
    
            <meta property="og:image" content="${iconUrl}" />
    
            <!--Google-->
            <meta name="fragment" content="!" />
            <meta name="description" content="${description}" />
          
            <meta property="og:url" content="http://${domain}/" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
    
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${iconUrl}" />
            <meta name="twitter:card" content="summary_large_image" />

            </head>
      
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <script src="public/libs/tween.umd.js"></script>
              <script src="public/libs/jquery.min.js"></script>
              <script src="public/libs/lil-gui@0.19.js"></script>

              <script>
                window.envParams = ${params ? params : {}};
                window.__DEV__ = ${process.env.NODE_ENV === "development"};
              </script>

              <script async src="public/${appName}.client.bundle.js"></script>
              <div id="root">${content}</div>
            </body>
      
          </html>
        `;
}

export default template;