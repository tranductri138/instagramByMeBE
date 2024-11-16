FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install --frozen-lockfile --production

COPY . /app

EXPOSE 5000

CMD ["yarn", "start"]
