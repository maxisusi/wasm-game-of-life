web_dir := "./www/"

prepare:
  npm install --prefix {{web_dir}}
  
# Build wasm backend
build: 
  wasm-pack build --target web

# Launches in devmode
dev: build
  npm run dev --prefix {{web_dir}}

