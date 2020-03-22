FROM node:12.14.1-stretch AS hojicha-backend

COPY --from=hojicha-build /hojicha/packages/backend /backend

WORKDIR /backend

CMD ["sh", "-c", "sleep 2 && npm run migrate && node index.js"]
