git pull
docker run -it --rm -v $(pwd):/app -w /app  node:16 yarn blog:build
rm -rf docs/*
mv ./blog/.vuepress/dist/* ./docs
git add -A
git commit -m update
git push
