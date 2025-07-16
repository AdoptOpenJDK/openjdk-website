import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteImagemin from 'vite-plugin-imagemin';
import eslintPlugin from 'vite-plugin-eslint';
import vitePluginSassDts from 'vite-plugin-sass-dts';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Handlebars from 'handlebars';
import * as glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to compile Handlebars templates to HTML
function handlebarsPlugin() {
  return {
    name: 'vite-plugin-handlebars-compiler',
    
    // This hook runs at the start of the build process
    buildStart: async () => {
      try {
        // Register partials
        const partialFiles = await glob.glob('src/handlebars/partials/*.handlebars');
        partialFiles.forEach(file => {
          const partialName = file.split('/').pop().replace('.handlebars', '');
          const partialContent = fs.readFileSync(file, 'utf-8');
          Handlebars.registerPartial(partialName, partialContent);
        });
        
        // Compile templates
        const templateFiles = await glob.glob('src/handlebars/*.handlebars', { ignore: ['src/handlebars/partials/**'] });
        templateFiles.forEach(file => {
          const templateName = file.split('/').pop().replace('.handlebars', '');
          const templateContent = fs.readFileSync(file, 'utf-8');
          const template = Handlebars.compile(templateContent);
          // Set production flag based on NODE_ENV
          const context = { 
            title: 'AdoptOpenJDK',
            production: process.env.NODE_ENV === 'production',
          };
          const html = template(context);
          if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist');
          }
          fs.writeFileSync(`dist/${templateName}.html`, html);
          console.log(`Compiled: ${templateName}.html`);
        });

        // Copy assets to dist/assets
        if (!fs.existsSync('dist/assets')) {
          fs.mkdirSync('dist/assets', { recursive: true });
        }

        // Copy all assets from src/assets to dist/assets
        const assetFiles = await glob.glob('src/assets/**/*.*');
        assetFiles.forEach(file => {
          const relativePath = file.replace('src/assets/', '');
          const targetPath = `dist/assets/${relativePath}`;
          
          // Create directories if they don't exist
          const targetDir = dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          fs.copyFileSync(file, targetPath);
        });
        
      } catch (error) {
        console.error('Error compiling handlebars templates:', error);
      }
    },
    
    // This hook modifies the Vite config before build starts
    config(config) {
      // Create an empty object for build.rollupOptions if it doesn't exist
      if (!config.build) config.build = {};
      if (!config.build.rollupOptions) config.build.rollupOptions = {};
      
      // Use a minimal JS entry point that won't interfere with our Handlebars compilation
      config.build.rollupOptions.input = {
        app: resolve(__dirname, 'src/main.js')
      };
      
      return config;
    },
    
    // Intercept dev server requests to handle Handlebars templates in development
    configureServer(server) {
      // Compile templates when the dev server starts
      const compileTemplates = async () => {
        try {
          // Register partials
          const partialFiles = await glob.glob('src/handlebars/partials/*.handlebars');
          partialFiles.forEach(file => {
            const partialName = file.split('/').pop().replace('.handlebars', '');
            const partialContent = fs.readFileSync(file, 'utf-8');
            Handlebars.registerPartial(partialName, partialContent);
          });
          
          // Pre-compile all templates on server start
          const templateFiles = await glob.glob('src/handlebars/*.handlebars', { ignore: ['src/handlebars/partials/**'] });
          const compiledTemplates = new Map();
          
          templateFiles.forEach(file => {
            const templateName = file.split('/').pop().replace('.handlebars', '');
            const templateContent = fs.readFileSync(file, 'utf-8');
            const template = Handlebars.compile(templateContent);
            compiledTemplates.set(templateName, template);
          });
          
          return compiledTemplates;
        } catch (error) {
          console.error('Error compiling handlebars templates:', error);
          return new Map();
        }
      };
      
      // Compile SCSS files to CSS and serve them during development
      const serveCompiledCSS = async (req, res, next) => {
        if (req.url === '/assets/app.css') {
          try {
            // Let Vite handle the SCSS compilation via its middleware
            req.url = '/src/scss/main.scss';
            return next();
          } catch (error) {
            console.error('Error serving compiled CSS:', error);
            return next();
          }
        }
        return next();
      };
      
      // Copy static assets during development
      const copyStaticAssets = async () => {
        try {
          // Create assets directory if it doesn't exist
          if (!fs.existsSync(resolve(__dirname, 'dist'))) {
            fs.mkdirSync(resolve(__dirname, 'dist'));
          }
          
          if (!fs.existsSync(resolve(__dirname, 'dist/assets'))) {
            fs.mkdirSync(resolve(__dirname, 'dist/assets'));
          }
          
          // Copy all assets from src/assets to dist/assets if they don't exist
          const assetFiles = await glob.glob('src/assets/**/*.*');
          assetFiles.forEach(file => {
            const relativePath = file.replace('src/assets/', '');
            const targetPath = resolve(__dirname, `dist/assets/${relativePath}`);
            
            // Create directories if they don't exist
            const targetDir = dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // Only copy if file doesn't exist or is newer
            if (!fs.existsSync(targetPath) || 
                fs.statSync(file).mtime > fs.statSync(targetPath).mtime) {
              fs.copyFileSync(file, targetPath);
            }
          });
        } catch (error) {
          console.error('Error copying static assets:', error);
        }
      };
      
      // Serve image assets directly from src/assets
      const serveImageAssets = async (req, res, next) => {
        if (req.url && req.url.startsWith('/assets/')) {
          const assetPath = req.url.substring('/assets/'.length);
          const filePath = resolve(__dirname, 'src/assets', assetPath);
          
          // Check if the file exists
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const fileContent = fs.readFileSync(filePath);
            
            // Set appropriate content type based on file extension
            const ext = assetPath.split('.').pop().toLowerCase();
            const contentTypes = {
              'png': 'image/png',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'gif': 'image/gif',
              'svg': 'image/svg+xml',
              'ico': 'image/x-icon',
              'pdf': 'application/pdf',
              // Add more as needed
              'default': 'application/octet-stream'
            };
            
            res.setHeader('Content-Type', contentTypes[ext] || contentTypes['default']);
            res.end(fileContent);
            return;
          }
        }
        next();
      };
      
      // Copy static assets when the server starts
      copyStaticAssets();
      
      // Register middleware to serve image assets
      server.middlewares.use(serveImageAssets);
      
      // Register middleware to serve compiled CSS
      server.middlewares.use(serveCompiledCSS);
      
      // Handle requests for HTML pages
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '/';
        let path = url === '/' ? '/index' : url;
        
        // Handle .html extensions properly
        if (path.endsWith('.html')) {
          const htmlFileName = path.split('/').pop();
          const templateName = htmlFileName.replace('.html', '');
          
          const compiledTemplates = await compileTemplates();
          
          if (compiledTemplates.has(templateName)) {
            // Render the template with the context
            const template = compiledTemplates.get(templateName);
            const context = { 
              title: 'AdoptOpenJDK',
              // Add any other context data you need here
            };
            
            const html = template(context);
            
            // Send the HTML response
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }
        }
        
        // Skip asset requests
        if (path.includes('.') && !path.endsWith('.html')) {
          return next();
        }
        
        // Remove trailing slash
        if (path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        
        // Get template name from path
        const templateName = path.substring(1) || 'index';
        
        // Only try to render HTML pages, not assets
        const compiledTemplates = await compileTemplates();
        
        if (compiledTemplates.has(templateName)) {
          // Render the template with the context
          const template = compiledTemplates.get(templateName);
          const context = { 
            title: 'AdoptOpenJDK',
            // Add any other context data you need here
          };
          
          const html = template(context);
          
          // Send the HTML response
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        
        // If not a Handlebars template or template not found, continue with default handling
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    vitePluginSassDts(),
    handlebarsPlugin(), // Our custom handlebars compiler plugin
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {},
    }),
    eslintPlugin(),
  ],
  build: {
    // Prevent Vite from clearing our compiled HTML files
    emptyOutDir: false,
    // Set output directory for Rollup's JS files
    rollupOptions: {
      output: {
        // Place JS assets in a specific directory structure
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    open: true,
  },
});