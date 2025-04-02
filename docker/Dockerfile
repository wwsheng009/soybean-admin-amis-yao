FROM node:16.17.0 as builder

ENV WORKDIR=/soybean-admin

WORKDIR $WORKDIR

COPY ./ $WORKDIR/
RUN chmod +x $WORKDIR/download_jssdk.sh && $WORKDIR/download_jssdk.sh

ARG version
ENV COMMITID=$version

RUN npm i -g pnpm

RUN pnpm install
RUN pnpm build

FROM nginx:alpine as prod

RUN mkdir /soybean-admin

COPY --from=builder /soybean-admin/dist /soybean-admin
COPY --from=builder /soybean-admin/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
