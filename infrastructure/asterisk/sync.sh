#!/bin/bash
API_URL="http://api-call.167.71.66.188.nip.io/api/internal/asterisk/config"

while true; do
  curl -s $API_URL > /tmp/config.json
  
  if [ -s /tmp/config.json ]; then
    cat /tmp/config.json | jq -r '.sipConf' > /etc/asterisk/sip.conf.new
    cat /tmp/config.json | jq -r '.extenConf' > /etc/asterisk/extensions.conf.new
    
    # Check if files changed
    if ! cmp -s /etc/asterisk/sip.conf /etc/asterisk/sip.conf.new || ! cmp -s /etc/asterisk/extensions.conf /etc/asterisk/extensions.conf.new; then
      cp /etc/asterisk/sip.conf.new /etc/asterisk/sip.conf
      cp /etc/asterisk/extensions.conf.new /etc/asterisk/extensions.conf
      echo "Config changed, reloading asterisk..."
      asterisk -rx 'core reload' || true
    fi
  fi
  
  sleep 30
done
