# YouTube for Onshape

A small web app that plays YouTube videos inside an Onshape right-panel extension.

- Paste a YouTube video/playlist link to play it.
- Paste an Edpuzzle link to open it in a popup window (Edpuzzle blocks embedding, so it can't play inside the panel).

## Develop

    npm install
    npm run dev      # local server
    npm run build    # outputs dist/

## Deploy

Pushing to `main` builds and publishes to GitHub Pages (enable Pages → Source: GitHub Actions in repo settings).

## Add to Onshape

1. Go to https://cad.onshape.com/appstore/dev-portal and create an application.
2. Under Extensions, add a **Right panel** extension with the Action URL set to your Pages URL plus `?documentId={$documentId}&workspaceId={$workspaceId}&elementId={$elementId}` (lets the app remember the link per document).
3. Add the app to your account and open it from the right-hand panel in a Part Studio / Assembly.

## Remembering links

The last link is saved per document in the browser's localStorage, so it is remembered on this browser only (not shared with teammates or other computers).
