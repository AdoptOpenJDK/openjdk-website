FROM node:20

RUN \
    apt-get update; \
    apt-get install --no-install-recommends -y \
    build-essential \
    curl; \
    rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash ubuntu

# expose ports which are being used in this project
EXPOSE 3001
EXPOSE 3000

CMD /bin/bash
