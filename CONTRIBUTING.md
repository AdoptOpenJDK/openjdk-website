# Contributing

## Getting set up to make changes on your fork (requires Node.js)

1. Install the `gulp` CLI

    ``` bash
    npm install --global gulp-cli
    ```

2. Install the project devDependencies

    ``` bash
    npm install
    ```

3. Start the auto-build scripts and BrowserSync (opens a new `localhost:3000` browser tab). Leave this process running during development.

    ``` bash
    npm start
    ```

    > **NOTE:** These build scripts enable you to view your changes locally. The build generates new files in two places: a new `/dist` directory (JS, CSS, images, etc), and `.html` files in the root directory. However, these files are ignored by .gitignore, and will not be included in commits.

4. Make changes in the `/src` directory. Every time you save a file, the script instantly picks up any new changes and displays them in your BrowserSync-connected window.

    > **NOTE:** You cannot view the website locally by, for example, opening `index.html` in a browser. The files must be served on `localhost`, and BrowserSync should do this automatically for you on `npm start`.

    > **PRO TIP:** Look in the Terminal/Command window immediately after you run `npm start`. BrowserSync provides 'Local' and 'External' Access URLs to view your latest changes live. If you have a phone or tablet connected to the same WiFi network, you can use the mobile browser to access the 'External' URL and view your latest changes in real-time. This makes it very easy to test your changes on different devices during development.

## Getting started by using Docker, so that you don't need to setup Node on your machine

1. Build image from Docker file

``` bash
docker build -t adoptnode .
```

2. Start Docker container

2.1. First time you will need to build container
You can use full path

``` bash
docker run -it -p 3001:3001 -p 3000:3000 -v <full path to the source>:/opt:rw --name containeradopt adoptnode
```

or use this shortcut


``` bash
docker run -it -p 3001:3001 -p 3000:3000 -v `pwd`:/opt:rw --name containeradopt adoptnode
```

2.2. Once container is created, just keep using it

``` bash
docker start containeradopt
```

In case something goes wrong, you can always recreate container.

3. Run commands in container

Once you start container you need to do several steps

3.1. Change user to nodeuser

``` bash
su - nodeuser
```

3.2. Move to /opt directory

``` bash
cd /opt
```

3.3. Install the project devDependencies (need to be done only once)

    ``` bash
    npm install
    ```

3.4. Start the auto-build scripts and BrowserSync (opens a new `localhost:3000` browser tab). Leave this process running during development.

    ``` bash
    npm start
    ```

    > **NOTE:** These build scripts enable you to view your changes locally. The build generates new files in two places: a new `/dist` directory (JS, CSS, images, etc), and `.html` files in the root directory. However, these files are ignored by .gitignore, and will not be included in commits.

3.5. Make changes in the `/src` directory. Every time you save a file, the script instantly picks up any new changes and displays them in your BrowserSync-connected window.

    > **NOTE:** You cannot view the website locally by, for example, opening `index.html` in a browser. The files must be served on `localhost`, and BrowserSync should do this automatically for you on `npm start`.

    > **PRO TIP:** Look in the Terminal/Command window immediately after you run `npm start`. BrowserSync provides 'Local' and 'External' Access URLs to view your latest changes live. If you have a phone or tablet connected to the same WiFi network, you can use the mobile browser to access the 'External' URL and view your latest changes in real-time. This makes it very easy to test your changes on different devices during development.


**IMPORTANT:** Node will run source code and all that is needed inside container. In order to see website and changes you are doing point browser to http://localhost:3000 and for UI http://localhost:3001

Modify code in your preferd IDE outside docker, it will be picked up automaticly


---

## Pull requests

When pull requests are opened, contributors can use the [staging job on Jenkins](https://ci.adoptopenjdk.net/view/website/job/adoptopenjdk-website-staging/) to build the pull request and view it at [staging.adoptopenjdk.net](https://staging.adoptopenjdk.net).

When pull requests are merged, they are automatically [built by Jenkins](https://ci.adoptopenjdk.net/view/website/job/adoptopenjdk-website-production/) into the [`gh-pages` branch](https://github.com/AdoptOpenJDK/openjdk-website/tree/gh-pages) on the openjdk-website repository, then deployed to the live site (as part of the GitHub Pages mechanism).

---

## Contribution guidelines

### How is the website populated with data?
The website uses JSON information from the [openjdk-releases](https://github.com/AdoptOpenJDK/openjdk-releases/releases) and [openjdk-nightly](https://github.com/AdoptOpenJDK/openjdk-nightly/releases) repositories on GitHub to populate each of the main pages.

However, the website does not directly call the GitHub API, because this would quickly exceed GitHub's API rate limit. Instead, the [adoptopenjdk-website-backend](https://ci.adoptopenjdk.net/view/all/job/adoptopenjdk-website-backend/) Jenkins job calls the GitHub API on a regular basis throughout the day, checks for changes, and stores the returned JSON data in `.json` files in the two repositories.

The website's JavaScript then uses a GET request to access these `.json` files, and generates the necessary HTML to display the information on-screen.

### HTML (Handlebars) pt.1
* Edit the `.handlebars` files in the `/src/handlebars` directory. These are built into HTML.
* 'Handlebars' files should only include the `<main>` element, containing the page's content, and `{{> header}}` / `{{> footer }}` tags.

### HTML (Handlebars) pt.2 (creating a new .handlebars file)
* The header, footer, metadata, and more, are contained within 'partials' (`/src/handlebars/partials`).
* This way, repeated content (e.g. header and footer) only has to be maintained in one place.
* Any new pages should have the header and footer partials inserted above and below the `<main>` tags respectively.
* When you insert the header partial into a `.handlebars` file, you should pass in a variable for the page title, e.g. `{{> header title='Releases - AdoptOpenJDK' }}`.
* When you insert the footer partial into a `.handlebars` file, you can pass in a variable for any page-specific JavaScript that you have written to be run 'on page load', e.g. `{{> footer script='<script>onIndexLoad();</script>' }}`. See the 'JS' section below for details on this system.
* If you are unsure, it is best to begin by copying an existing `.handlebars` file, and deleting the content between the `<main>` tags.

### Menu system
* The menu contents can be changed in `/src/handlebars/partials/menu.handlebars`.

### Social bar
* The social bar contents can be changed in `/src/handlebars/partials/social-bar.handlebars`. It is shown in various places on the site depending on screen width.

### SCSS
* Only use the units `rem` and `%`. __Do not__ use `em` or `px`.
* Try to use only the colours that exist as variables at the top of each stylesheet, such as `$mainblue`.
* Use `styles-1-large-main.scss` for global CSS changes
* Use individual scss files for styles that are specific to a page, such as `styles-nightly.scss`.
* Try to use layouts that will shrink and flow into appropriate layouts for tablet/mobile.
* However, if this is not enough, you can use `...medium.scss` and `...small.scss` to specify what happens to the CSS at two breakpoints.

### JS
* Always run `npm test` to run a linter on your JS before pushing any changes / raising a PR.
* Use `global.js` for global JavaScript functions.
* Use individual `.js` files for functions that are specific to a page, such as `nightly.js`. For any functions that should happen 'on page load', call them from within the root function for that page, e.g. `onNightlyLoad(){...}`.
* If you create a new `.handlebars` file that requires new JavaScript functions:
  1. Create a new `.js` file inside `/src/js` to match the page's name.
  2. Re-run `npm start` to add this new file to the `/dist` directory.
  3. Write a new root function in this file such as `function onNightlyLoad(){...}`.
  4. Any functions that you want to run after the page has loaded should be called from here.
  5. Refer to the 'HTML (Handlebars)' section above for guidance on how to call this root function.

### Adding a new platform/arch/OS (or removing one)
* `platforms.json` contains a `platforms` array.
* This array dictates which platforms appear across the website and API. Changing this array will update the every page accordingly, for each specified platform that is available.
* Each platform is contained within an object, and has a range of values/attributes.
* To add a new platform, copy an existing object `{...}` and paste it into the array in the desired order (remembering to use commas `,` to separate each object).
* Then, update the values as follows:
  - **officialName**: The 'legal name' or official name for the OS. This is displayed on most pages.
  - **searchableName**: a string that appears in the FILE NAME of binaries, installers, and checksums, that can be used to identify the platform.
  - **logo**: examplefilename.png. The path to the logo folder is set below (the 'logoPath' var).
  - **binaryExtension**: should include the dot at the beginning of the extension, e.g .tar.gz or .zip
  - **requirements**: currently just displayed on the 'latest build' page. Should be a short string identifying the most important min. requirement of a machine to run the latest build.
  - **architecture**: 64 or 32. Not currently used. May be required for differentiation between future builds, primarily for displaying the architecture type.
  - **osDetectionString**: this string is searched by the OS detection library platform.js to find a match. Include as many words as you like, separated by spaces.


### Images
* As a general rule, use `.png` images, especially for logos and icons. For larger images with no transparent areas, use `.jpeg` / `.jpg`.
* When adding new images to the website, there are two goals: consistency and compression.
* Ensure that there is no whitespace around the edges of your new image, as this will make it appear smaller than it should be.
* Consider the other images on that page. Are you adding another image to a 'set' that already exists? E.g. a new logo on the Sponsors page, or a new platform icon to the Latest page.
* If yes, look at the existing 'set' of images - they will either have a consistent height or a consistent width in pixels. You should reduce the size of your new image to match the rest of the 'set'.
* If not, bear in mind that many people will be viewing the website on very high-resolution screens. As a general rule, you can make images look good on these screens by using an image that is approximately 2x larger than it needs to be, then using CSS to reduce the displayed size of the image to a suitable width or height.
* Although the `gulp` task is set up to compress images automatically, it is good practice to use [tinypng.com](https://tinypng.com/) to reduce the file size first. This website is recommended because it produces consistent, high-quality results.
* Add the new image to `/src/assets`, then re-run `npm start`.
* Add it to a `.handlebars` file:
```html
<img src='./dist/assets/your-new-image.png' alt="Add a description of the image here">
```

### The Latest page grid system
* You can easily change the maximum number of platforms that appear on the Latest page platform selector grid.
* Just update the `max-width` property for `#latest-selector`, which you can find in `src/scss/styles-4-releases.scss`.
* Adjust this and check what value looks the best on all window widths for the number of platforms currently on offer.
* However, you can in theory select almost any value - it will not 'break' the layout, just change its behaviour.

---

## Gulp / `gulpfile.js` / builds

### What is Gulp?
Gulp is an automated 'task runner'. Any repetitive tasks that a developer might need to complete on a regular basis can be automatically run by Gulp. For example, you can use Gulp to concatenate and minify your CSS and JS every time a change is made to any CSS or JS file. You can also use Gulp to run compilation or build tasks, such as converting SASS to CSS, generating sitemaps, testing code for lint errors, and more.

### Using Gulp to build AdoptOpenJDK.net
In this project, Gulp can be run in two different ways:
1. `npm start` or just `gulp`: This continuously watches for changes to the source code during development, and re-builds/re-serves the output in a live, connected browser window each time a change is detected.
2. `gulp build`: This runs the same build that is used by the Production and Staging servers. The key differences are that the `gulp.watch` processes are not started, BrowserSync is not started, a linter is run to check the JS, and a sitemap is generated.

### Contributing to `gulpfile.js`

#### The `gulpfile.js` structure
- At the top of `gulpfile.js`, all of the add-on `npm` Gulp packages, such as `gulp-rename` and `gulp-concat`, are loaded into variables with `require(...);`.
- Following this, all of the `gulp.task(...);` tasks are defined.
- If you run, for example, `gulp scripts`, then just the `gulp.task('scripts'...` task would run. However, the first two tasks (`gulp default` and `gulp build`) are different - their sole purpose is to run _other_ tasks. They can be seen as 'parent' tasks, while the others are 'child' tasks.
- For the purposes of this guide, we will run through what happens when you run `gulp default` (just `gulp` for short, or alternatively `npm start`).

#### What happens, step-by-step, when I run `npm start`?
1. The `gulp.task(default, function(){...});` parent task is started.
2. Inside this task, the 'Run Sequence' package is used to define exactly when each of the child tasks will run.
3. Task names inside an array run asynchronously (for efficiency, where a specified order is not required), in this case `['handlebars','scripts','styles','images','icon']`.
4. Once these tasks have completed, the remaining tasks run synchronously in the specified order: `'inject','watch','browser-sync'`.

  > **NOTE ON ERROR CATCHING:** `.on('error', gutil.log)` appears after every line of code that is likely to error. This is to improve the quality of Gulp's default error reporting if something goes wrong.

#### Walkthroughs of each task:

- `gulp.task('handlebars'...` - This task simply takes the `.handlebars` files from the `src/handlebars` directory, and converts them into HTML files, which are output into the root `/` directory. Along the way, there are 'partials' - `src/handlebars/partials/*.handlebars` files that are common to every page - header, footer, menu, etc. These partials are built into these HTML files at the specified location, e.g. `header.handlebars` appears at the top of each built HTML file. Variables are also sometimes passed into these partials, such as the `title` variable in the header, so a different title can appear in each page's header.
- `gulp.task('scripts'...` - This task looks for all `.js` files inside the `src/js` directory. It then concatenates them together into one long JS file in alphabetical/numeric order (hence the importance of numbers at the beginning of the JS filenames), and creates a file in `dist/js` called `scripts.js`. This file's sole purpose is to allow for easier debugging (both manually by eye and automatically with `eslint`). Following this step, the Gulp task runs `uglify` to minify/compress the JS, adds the filename suffix `.min.js`, then adds a unique hash to the filename. This hash is important - whenever the JavaScript is changed, the hash changes, which forces both our browsers and Cloudflare to re-load the file, bypassing any cache that might have otherwise prevented a reload. Finally, the new hashed, minified JS file is output to the same `dist/js` directory.
- `gulp.task('styles'...` - This task begins by compiling all `.scss` files in the `src/scss` directory to standard `css`. Following this step, the `styles` task follows the same process as `scripts` - it concatenates everything into a single `css` file, minifies it, and adds a hash. The result is two files output to `dist/css`: `styles.css` and `styles.min-******.css`
- `gulp.task('images'...` - This task is very simple. It takes all images from the `src/assets` directory, compresses them, and outputs to the `dist/assets` directory.
- `gulp.task('icon'...` - This task only copies icon files from `src/assets ` to `dist/assets`. This allows us to keep icon files in the same working directory (`src`) as everything else.
- `gulp.task('inject'...` - This task begins by looking for the minified, hashed JS and CSS files in `dist`. It then injects links to these into each of the built HTML files, between special tags:
    ```
    <!-- inject:js -->
    <!-- endinject -->
    ```
- `gulp.task('watch'...` - This task runs continuously. It watches for changes to files in the `src` directory, and re-runs the relevant task(s) whenever a change is detected. For instance, when a `.js` file is changed, the `scripts` and `inject` tasks are re-run, followed by a special browser reload function that keeps your browser window up-to-date with the changes you are making.
- `gulp.task('browser-sync'...` - This task also runs continuously. It initially serves `index.html` on `localhost:3000` to emulate the website running on a server, then allows for instant reloads when the `watch` task detects and rebuilds changes. BrowserSync also logs an 'External Access URL' to the Terminal/command window that you can use to instantly test your changes to the website on WiFi-connected devices, such as mobiles and tablets.
