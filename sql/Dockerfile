FROM mcr.microsoft.com/mssql/server:2017-latest-ubuntu

ENV ACCEPT_EULA Y
ENV MSSQL_PID Developer

EXPOSE 1433

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy initialization scripts
COPY . /usr/src/app

RUN chmod +x /usr/src/app/run-initialization.sh

CMD /bin/bash ./entrypoint.sh
