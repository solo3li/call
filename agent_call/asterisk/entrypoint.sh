#!/bin/bash
# Start the sync script in the background
/sync.sh &

# Start Asterisk in foreground
exec /usr/sbin/asterisk -f
