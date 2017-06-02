# 8.0.0-0.18.1
FROM node:8.0.0-slim

RUN apt-get update \
&& apt-get install -y \
    make \
    gcc \
    g++ \
    python \
&& cd /usr/local/lib/node_modules \
&& npm install --production sharp@0.18.1 \
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