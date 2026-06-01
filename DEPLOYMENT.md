# Deployment Guide for Pixlogic

This guide explains how to deploy Pixlogic to GitHub Pages and other hosting platforms.

## GitHub Pages Deployment (Recommended)

The project is pre-configured for GitHub Pages deployment with automatic CI/CD.

### Automatic Deployment

Every push to the `main` branch automatically triggers deployment via GitHub Actions:

1. **Push your code to main:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions will:**
   - Install dependencies
   - Run the build process
   - Deploy to GitHub Pages
   - Make the site live at: `https://acaprari.github.io/pixlogic/`

3. **Monitor deployment:**
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Watch the "Deploy to GitHub Pages" workflow run

### Manual Deployment

You can also deploy manually using the gh-pages package:

```bash
npm run deploy
```

This command:
1. Runs `npm run build` (via predeploy script)
2. Deploys the `dist/` folder to the `gh-pages` branch
3. GitHub Pages automatically serves from the `gh-pages` branch

### First-Time Setup

If this is your first deployment, you need to enable GitHub Pages:

1. **Go to your repository on GitHub**
2. **Navigate to Settings > Pages**
3. **Configure the source:**
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. **Click Save**

GitHub will provide the URL where your site is published (usually `https://username.github.io/repository-name/`)

### Workflow Configuration

The deployment workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:
```

Key features:
- Runs on every push to `main`
- Can be triggered manually via workflow_dispatch
- Uses Node.js 24
- Caches npm dependencies for faster builds
- Automatically handles GitHub Pages deployment

## Forking and Customizing

If you fork this repository and want to deploy to your own GitHub Pages:

### 1. Update the Base Path

Edit `vite.config.ts` to change the base path:

```typescript
export default defineConfig({
  base: '/your-repository-name/',  // Change this!
  // ... rest of config
})
```

### 2. Update README Links

Update the live demo link in `README.md`:

```markdown
[Play Pixlogic](https://your-username.github.io/your-repository-name/)
```

### 3. Enable GitHub Pages

Follow the "First-Time Setup" steps above in your forked repository.

### 4. Deploy

Push to main or run `npm run deploy`.

## Alternative Hosting Platforms

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure for production:**
   - Update `vite.config.ts` to set `base: '/'` (Vercel uses root path)
   - Run `vercel --prod`

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure:**
   - Update `vite.config.ts` to set `base: '/'`
   - Create `netlify.toml` if needed

### Static File Hosting

For any static file hosting (AWS S3, Azure Static Web Apps, etc.):

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder to your hosting provider**

3. **Configure:**
   - Update `vite.config.ts` base path as needed
   - Ensure the server serves `index.html` for all routes (SPA)

## Environment Variables

### API Key Handling

The application requires an Anthropic API key. There are two approaches:

#### Option 1: User-Provided Keys (Recommended)
- Users enter their own API key in the app
- Key is stored in browser localStorage
- No server-side configuration needed
- This is the default behavior

#### Option 2: Embedded Key (Not Recommended)
- Add API key to environment variables
- Create `.env.local` file: `VITE_ANTHROPIC_API_KEY=your_key`
- Build with the key embedded
- **Warning:** Anyone can extract the key from the built JavaScript

### GitHub Actions Secrets

To use secrets in GitHub Actions:

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add `VITE_ANTHROPIC_API_KEY` with your API key
4. The workflow will use this during build

**Note:** This is generally not recommended for client-side apps, as the key becomes visible in the built code.

## Build Verification

Before deploying, verify the build works correctly:

```bash
# Build the project
npm run build

# Preview the production build locally
npm run preview
```

Visit the preview URL (usually `http://localhost:4173`) and test:
- API key input works
- Puzzle generation works
- Game board renders correctly
- All assets load properly

## Troubleshooting

### 404 Errors on GitHub Pages

If you see 404 errors:
1. Verify the `base` path in `vite.config.ts` matches your repository name
2. Ensure GitHub Pages is enabled in repository settings
3. Check that the `gh-pages` branch exists and has content
4. Wait a few minutes for GitHub Pages to update

### Assets Not Loading

If CSS/JS files don't load:
1. Check the `base` path in `vite.config.ts`
2. Verify asset paths in built `dist/index.html`
3. Ensure all paths start with `/pixlogic/` (or your base path)

### Build Failures

If the build fails:
1. Run `npm ci` to ensure clean dependencies
2. Check TypeScript errors: `npx tsc --noEmit`
3. Verify all tests pass: `npm test`
4. Review GitHub Actions logs for specific errors

### API Key Issues

If API key isn't working:
1. Verify the key is valid at [Anthropic Console](https://console.anthropic.com/)
2. Check browser console for API errors
3. Ensure the key has proper permissions
4. Try clearing localStorage and re-entering the key

## Performance Optimization

For production deployments:

1. **Enable compression** on your hosting platform (gzip/brotli)
2. **Set up CDN** for faster global delivery
3. **Configure caching headers** for static assets
4. **Monitor bundle size**: Current build is ~354 KB (gzipped ~105 KB)

## Monitoring

After deployment, monitor:
- **GitHub Actions**: Check workflow runs for failures
- **Browser Console**: Test the deployed site for errors
- **API Usage**: Monitor your Anthropic API usage/costs
- **User Feedback**: Watch for issues or bug reports

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm test` and `npm run test:e2e`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Preview works correctly (`npm run preview`)
- [ ] Base path is configured correctly in `vite.config.ts`
- [ ] README has correct live demo URL
- [ ] LICENSE file is up to date
- [ ] API key handling is configured
- [ ] GitHub Pages is enabled in repository settings
- [ ] No sensitive data in code or config

## Continuous Deployment

The project uses GitHub Actions for CD. The workflow:

1. **Triggers** on push to `main` branch
2. **Checks out** the code
3. **Sets up** Node.js 18 with npm cache
4. **Installs** dependencies with `npm ci`
5. **Builds** the project with `npm run build`
6. **Uploads** the `dist/` folder as a Pages artifact
7. **Deploys** to GitHub Pages environment

No manual intervention needed - just push to `main`!

## Rollback

If you need to rollback a deployment:

1. **Find the previous working commit:**
   ```bash
   git log
   ```

2. **Revert to that commit:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Or manually deploy an older version:**
   ```bash
   git checkout <commit-hash>
   npm run deploy
   git checkout main
   ```

## Support

For deployment issues:
- Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Review [Vite Deployment Guide](https://vite.dev/guide/static-deploy.html)
- Open an issue on the repository
- Check GitHub Actions logs for error details

---

Happy deploying!
