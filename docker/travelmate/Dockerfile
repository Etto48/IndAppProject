FROM node:latest

WORKDIR /app

COPY ./pages /app/pages
COPY ./public /app/public
COPY ./src /app/src
COPY ./package.json /app/package.json
COPY ./next.config.ts /app/next.config.ts
COPY ./tsconfig.json /app/tsconfig.json
COPY ./docker/travelmate/setup.sh /app/setup.sh
COPY ./docker/travelmate/run.sh /app/run.sh
COPY ./.env /app/.env
RUN chmod +x /app/setup.sh && \
    /app/setup.sh

EXPOSE 3000

CMD ["/app/run.sh"]