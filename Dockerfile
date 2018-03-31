FROM ubuntu

RUN       \
    apt-get update; \
    apt-get install -y \
    build-essential \
    curl; \
    rm -rf /var/lib/apt/lists/*

# setup nodejs
RUN curl -sL https://deb.nodesource.com/setup_9.x |  bash -
RUN  apt-get install -y nodejs


# do first step from Contribution
RUN npm install --global gulp-cli

# add nodeuser to be used during development
RUN useradd nodeuser
RUN cd /home && mkdir nodeuser &&\
    chown -R nodeuser:nodeuser nodeuser;

# expose ports which are using in this project
EXPOSE 3001
EXPOSE 3000

CMD /bin/bash
