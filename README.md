# YouTube for Onshape

A small web app that plays YouTube videos inside an Onshape right-panel extension.

- Paste a YouTube video/playlist link to play it.
- Optional search: click ⚙ and add a YouTube Data API key (stored only in your browser).

## Develop

    npm install
    npm run dev      # local server
    npm run build    # outputs dist/

## Deploy

Pushing to `main` builds and publishes to GitHub Pages (enable Pages → Source: GitHub Actions in repo settings).

## Add to Onshape

1. Go to https://cad.onshape.com/appstore/dev-portal and create an application.
2. Under Extensions, add a **Right panel** extension with the Action URL set to your Pages URL.
3. Add the app to your account and open it from the right-hand panel in a Part Studio / Assembly.
