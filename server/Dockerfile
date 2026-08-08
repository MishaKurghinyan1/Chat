FROM node:22.18.0

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8000

CMD ["yarn", "start:dev"]