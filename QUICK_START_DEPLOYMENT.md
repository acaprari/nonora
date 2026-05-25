# Quick Start: Deploying Pixlogic to GitHub Pages

This guide gets you from setup to deployed in under 5 minutes.

## 1. Enable GitHub Pages (One-Time Setup)

1. Go to your repository: https://github.com/acaprari/pixlogic
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `gh-pages`
   - **Folder**: Select `/ (root)`
5. Click **Save**

GitHub will show a message: "Your site is ready to be published at https://acaprari.github.io/pixlogic/"

## 2. Deploy Your Site

You have two options:

### Option A: Automatic Deployment (Recommended)

Just push your code to the main branch:

```bash
git add .
git commit -m "Add documentation and deployment setup"
git push origin main
```

GitHub Actions will automatically:
1. Build your project
2. Deploy to GitHub Pages
3. Make it live within 1-2 minutes

**Watch the deployment:**
- Go to the "Actions" tab in your repository
- You'll see "Deploy to GitHub Pages" running
- Wait for the green checkmark ✅

### Option B: Manual Deployment

Run this command in your project directory:

```bash
npm run deploy
```

This builds and deploys directly to the gh-pages branch.

## 3. Verify Your Site

1. Wait 1-2 minutes after deployment
2. Visit: https://acaprari.github.io/pixlogic/
3. Test the game:
   - Enter your Anthropic API key
   - Generate a puzzle
   - Play the game
   - Verify everything works

## 4. Future Deployments

Every time you push to `main`, your site automatically updates!

```bash
git add .
git commit -m "Your changes"
git push origin main
```

No need to run any deploy commands - it's automatic!

## Troubleshooting

### Site shows 404

**Problem**: Page not found error

**Solution**:
1. Check that GitHub Pages is enabled in Settings > Pages
2. Verify the `gh-pages` branch exists in your repository
3. Wait 2-3 minutes for GitHub to propagate changes
4. Try clearing your browser cache

### Assets not loading (blank page)

**Problem**: CSS/JS files return 404

**Solution**: The base path is already configured correctly in `vite.config.ts`. If you forked this repo and renamed it, you need to update:

```typescript
// In vite.config.ts
base: '/your-repo-name/',  // Change 'pixlogic' to your repo name
```

Then rebuild and deploy:
```bash
npm run deploy
```

### Build fails in GitHub Actions

**Problem**: Red X in Actions tab

**Solution**:
1. Click on the failed workflow
2. Read the error message
3. Common fixes:
   - Run `npm test` locally to check for test failures
   - Run `npm run build` locally to check for build errors
   - Make sure all changes are committed
   - Check that dependencies are up to date

### API key not working

**Problem**: Can't generate puzzles after deployment

**Solution**:
- The API key is stored in your browser's localStorage
- Each user needs their own Anthropic API key
- Get a key from: https://console.anthropic.com/
- The key is never sent to any server except Anthropic

## That's It!

Your site is now live at: **https://acaprari.github.io/pixlogic/**

Share it with the world! 🎉

## Additional Resources

- **Full README**: See [README.md](./README.md) for complete documentation
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced deployment options
- **E2E Tests**: See [E2E_TEST_README.md](./E2E_TEST_README.md) for testing documentation
- **GitHub Pages Docs**: https://docs.github.com/en/pages

## Getting Help

- Check the [Troubleshooting section in DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)
- Review GitHub Actions logs in the Actions tab
- Open an issue on the repository
- Check Vite's deployment guide: https://vite.dev/guide/static-deploy.html

---

Happy deploying! 🚀
