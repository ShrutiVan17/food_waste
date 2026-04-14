# Deploy FreshTurn

FreshTurn is a static site, so it can be deployed without a backend runtime.

## Option 1: Netlify

1. Create a new Netlify site.
2. Drag and drop this project folder into Netlify Deploys, or connect a Git repo.
3. Set the publish directory to the project root.

## Option 2: Vercel

1. Import the project into Vercel.
2. Choose `Other` or static site.
3. Keep the output directory as the project root.

## Option 3: GitHub Pages

1. Push the folder to a GitHub repository.
2. Enable GitHub Pages from the repository settings.
3. Deploy from the root or `/docs` depending on your repo setup.

## Important note

The app stores its data in the browser using `localStorage`, so each user sees and saves data locally on their own device. For a production deployment with shared restaurant data, the next step is replacing local storage with a real backend and database.
