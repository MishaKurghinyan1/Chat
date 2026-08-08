FROM node:22.18.0

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]