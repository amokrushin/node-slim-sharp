# 7.10.0-0.18.0
FROM node:7.10.0-slim

RUN apt-get update \
&& apt-get install -y \
    make \
    gcc \
    g++ \
    python \
&& npm install -g sharp@0.18.0 \
&& cd /usr/local/lib/node_modules/sharp \
&& yarn link \
&& apt-get remove --purge -y \
    make \
    gcc \
    g++ \
    python \
    `apt-mark showauto` \
&& rm -rf \
    /var/lib/apt/lists/* \
    /tmp/*