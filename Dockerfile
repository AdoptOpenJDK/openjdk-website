FROM ubuntu

RUN \
    apt-get update; \
    apt-get install --no-install-recommends -y \
    build-essential \
    curl; \
    rm -rf /var/lib/apt/lists/*

# setup nodejs
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install --no-install-recommends -y nodejs

RUN useradd -ms /bin/bash ubuntu

# do first step from Contribution
RUN npm install --global gulp-cli

# expose ports which are being used in this project
EXPOSE 3001
EXPOSE 3000

CMD /bin/bash
