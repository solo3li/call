FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y asterisk curl jq
COPY sync.sh /sync.sh
COPY entrypoint.sh /entrypoint.sh
CMD ["/entrypoint.sh"]
