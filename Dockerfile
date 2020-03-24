FROM node:12.14.1-stretch AS hojicha-build

WORKDIR /hojicha

ARG NODE_CONFIG_ENV
ENV NODE_CONFIG_ENV=$NODE_CONFIG_ENV

COPY package.json lerna.json /hojicha/

RUN npm install --quiet && \
    npm cache clean --force

WORKDIR /hojicha/packages

RUN mkdir common && \
    mkdir config && \
    mkdir backend && \
    mkdir frontend

COPY packages/common/package.json common/
COPY packages/config/package.json config/
COPY packages/backend/package.json backend/
COPY packages/frontend/package.json frontend/

WORKDIR /hojicha

# First bootstrap we cache the external packages
RUN npx lerna bootstrap --force-local

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