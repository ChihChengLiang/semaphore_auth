FROM node:12.14.1-stretch AS hojicha-build

WORKDIR /hojicha

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

COPY package.json lerna.json /hojicha/

RUN npm install --quiet && \
    npm cache clean --force

WORKDIR /hojicha/packages

RUN mkdir contracts && \
    mkdir common && \
    mkdir config && \
    mkdir backend && \
    mkdir frontend

COPY packages/contracts/package.json packages/contracts/yarn.lock contracts/
COPY packages/common/package.json packages/common/yarn.lock common/
COPY packages/config/package.json packages/config/yarn.lock config/
COPY packages/backend/package.json packages/backend/yarn.lock backend/
COPY packages/frontend/package.json packages/frontend/yarn.lock frontend/

WORKDIR /hojicha

# First bootstrap we cache the external packages
RUN npx lerna bootstrap --force-local --ignore @hojicha/*

WORKDIR /hojicha/packages

COPY packages/common common
COPY packages/config config
COPY packages/backend backend
COPY packages/frontend frontend

WORKDIR /hojicha/

# Second bootstrap we install the local dependencies
RUN npx lerna bootstrap --force-local

ENV NODE_ENV=production

RUN cd packages/frontend && \
    npm run build