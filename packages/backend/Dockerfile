FROM node:12.14.1-stretch AS hojicha-backend

COPY --from=hojicha-build /hojicha/packages/backend /backend
COPY --from=hojicha-build /hojicha/packages/config /config
COPY --from=hojicha-build /hojicha/packages/common /common

WORKDIR /backend

CMD ["sh", "-c", "sleep 2 && npm run migrate && node index.js"]
