if [ ! -d "./public/shoot-balloon" ]; then
  mkdir ./public/shoot-balloon
fi

cp -r ./shoot-balloon/build/web-mobile/** ./public/shoot-balloon/
