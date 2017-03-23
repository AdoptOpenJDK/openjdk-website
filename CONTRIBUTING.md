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

3. Start the auto-build scripts

    ```
    npm start
    ```

4. Make changes **only** in the `/src` directory
    > Please note that `api.js` is an exception to this rule: it appears only in `/dist`, and should be edited there.

5. Open `/index.html` in any browser, and refresh the page after saving your changes to `/src`.

---

## Contribution guidelines

### HTML (Handlebars) pt.1
* **Do not** edit the `.html` files in the root directory. They are created and updated by the build process.
* Instead, edit the `.handlebars` files in the `/src/handlebars` directory.
* 'Handlebars' files should only include the `<main>` element, containing the page's content, and `{{> header}}` / `{{> footer }}` tags.

### HTML (Handlebars) pt.2 (creating a new .handlebars file)
* The header, footer, metadata, and more, are contained within 'partials' (`/src/handlebars/partials`).
* This way, repeated content (e.g. header and footer) only has to be maintained in one place.
* Any new pages should have the header and footer partials inserted above and below the `<main>` tags respectively.
* When you insert the header partial into a `.handlebars` file, you should pass in a variable for the page title, e.g. `{{> header title='Releases - AdoptOpenJDK' }}`.
* When you insert the footer partial into a `.handlebars` file, you can pass in a variable for any page-specific JavaScript that you have written to be run 'on page load', e.g. `{{> footer script='<script>onIndexLoad();</script>' }}`. See the 'JS' section below for details on this system.
* If you are unsure, it is best to begin by copying an existing `.handlebars` file, and deleting the content between the `<main>` tags.

### Menu system
* The menu contents can be changed in `/src/handlebars/partials/header.handlebars`.
* Add or update the entries within `<div id='menu-content'>...</div>`.

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
* If you create a new `.handlebars` file that requires new JavaScript functions:
  1. Create a new `.js` file inside `/src/js` to match the page's name.
  2. Re-run `npm start` to add this new file to the `/dist` directory.
  3. Write a new root function in this file such as `function onNightlyLoad(){...}`.
  4. Any functions that you want to run after the page has loaded should be called from here.
  5. Refer to the 'HTML (Handlebars)' section above for guidance on how to call this root function.
