FROM node:20-alpine

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY next.config.mjs next.config.mjs
COPY app app
COPY public public
COPY next-env.d.ts next-env.d.ts
COPY .eslintrc.json .eslintrc.json

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
