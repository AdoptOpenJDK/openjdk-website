# Contributing

## Getting set up to make changes on your fork (requires Node.js)

1. Install the `gulp` CLI

    ```
    npm install --global gulp-cli
    ```

2. Install the project devDependencies

    ```
    npm install
    ```

3. Start the live compile / concat / minify scripts

    ```
    npm start
    ```

4. Make your changes in the root and `/src` directories.
Please note that there are some files, notably `api.js`, that appear only in `/dist` and should be edited there.

---

## Contribution guidelines

### SCSS
* Only use the units `rem` and `%`. __Do not__ use `em` or `px`.
* Try to use only the colours that exist as variables at the top of each stylesheet, such as `$mainblue`.
* Use `styles-1-large-main.scss` for global CSS changes
* Use individual scss files for styles that are specific to a page, such as `styles-nightly.scss`.
* Try to use layouts that will shrink and flow into appropriate layouts for tablet/mobile.
* However, if this is not enough, you can use `...medium.scss` and `...small.scss` to specify what happens to the CSS at two breakpoints.

### JS
* Use `global.js` for global JavaScript functions.
* Use individual `.js` files for functions that are specific to a page, such as `nightly.js`. For any functions that should happen 'on page load', call them from within the root function for that page, e.g. `onNightlyLoad(){...}`.
* If you create a new `.html` page that requires new JavaScript functions:
  1. Create a new `.js` file inside `/src/js` to match the page's name.
  2. Re-run `npm start` to add this new file to the `/dist` directory.
  3. Write a new root function in this file such as `function onNightlyLoad(){...}`.
  4. Any functions that you want to run after the page has loaded should be called from here.
  5. Add a `<script>` tag to the bottom of your new `.html` page's `<body>` element to run this root function, such as `<script>onNightlyLoad();</script>`.
