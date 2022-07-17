from node:18

RUN apt-get update &&\
    apt-get install -y git curl
# RUN npm -v
# RUN node -v
RUN npm i -g nodemon

RUN mkdir -p /data/CODE

RUN mkdir -p /caracAL
WORKDIR /caracAL
RUN git clone https://github.com/SjurWarEagle/caracAL

WORKDIR /caracAL/caracAL/
RUN npm install
ENTRYPOINT ['node','main.js']
