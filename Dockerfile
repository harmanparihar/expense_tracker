FROM node:carbon
WORKDIR /src
COPY . /src/
EXPOSE 1337
CMD ["node", "index.js"]
