mkdir tmp
mv sitemap.xml tmp/
find . -type f ! -name '*.html' ! -name '*.pdf' -maxdepth 1 -mindepth 1  -delete
find . -type d -not -name 'dist' -not -name '.git' -maxdepth 1 -mindepth 1 -exec rm -rf {} \;
# After this bulk-delete, copy across some other necessary files from the master branch:
git checkout main -- NOTICE
git checkout main -- LICENSE
cp tmp/sitemap.xml .
git checkout main -- robots.txt
git checkout main -- CNAME
echo "These files are ready to be moved onto the production web server:"
ls
