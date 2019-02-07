FROM node

LABEL AUTHOR=triplepointfive@gmail.com

RUN apt-get update && apt-get install -y curl apt-transport-https && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install --no-install-recommends yarn

WORKDIR /apps/kugo

CMD bash -c "yarn install ; npx tsc -w"
