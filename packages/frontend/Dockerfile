FROM nginx:1.17.1-alpine AS hojicha-frontend

COPY --from=hojicha-build /hojicha/packages/frontend/dist /static
COPY --from=hojicha-build /hojicha/packages/frontend/nginx.conf /etc/nginx/nginx.conf

WORKDIR /

CMD nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
