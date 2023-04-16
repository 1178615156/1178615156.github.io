git pull
docker run -it --rm -v $(pwd):/app -w /app -p 8080:8080  node:16 yarn blog:build
rm -rf docs/*
mv ./blog/.vuepress/dist/* ./docs
git add -A
git commit -m update
git push
