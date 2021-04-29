# Git Log app

Gitlog is a svelte app frontend only I use to share my git commit calendars in github format.
Gitlog requires a script running from cron updating the git project logs, and an nginx webserver to serve this app and to serve the gitlog files in json format

example: <https://de-neef.net/gitlog>

## Installation

### Prepare git-server

install this script on your git-server. I use git-shell, so should be installed in ``git-shell-commands`` dir

```sh
~ # cat ~git/git-shell-commands/update_gitlogs
#!/bin/sh
BD=/srv/gitlogs
AFTER=${1:-"yesterday 0:00"}
BEFORE=${2:-"today 0:00"}
LOGALL=

umask 022
for i in *.git
do
        LOG=$(git --git-dir $i log --all --after="$AFTER" --before="$BEFORE" --pretty=format:%ad --date=short)
        if [ -n "$LOG" ]; then
                [ -z "$LOGALL" ] && LOGALL="$LOG" || LOGALL="$LOGALL\n$LOG"
                GD=${i%.git}
                FO=$BD/$GD
                mkdir -p "$FO"
                echo -e "$LOG" | sort | uniq -c >> "$FO/git.log"
                for readme in `git --git-dir $i ls-tree -r master --name-only | grep -Ei '^(install|readme)\.(txt|md)$'`
                do
                        git --git-dir $i archive master $readme | tar -xO >> "$FO/$readme"
                done
        fi
done

if [ -n "$LOGALL" ]; then
        echo -e "$LOGALL" | sort | uniq -c >> $BD/git.log
fi

exit 0
```

And add cronjob:

```sh
3       0       *       *       *       update_gitlogs >> /tmp/gitlog.output 2>&1
```

### Prepare nginx webserver for serving app and git logs
Add this config to your nginx webserver:

```nginx
        location /gitlog {
                alias /var/www/localhost/gitlog/;
                try_files $uri $uri/ =404;
                location /gitlog/gitlogs {
                        add_header Access-Control-Allow-Origin *;
                        alias /srv/gitlogs/;
                        autoindex on;
                        autoindex_format json;
                        autoindex_localtime on;
                }
        }

```


### Prepare and install this app
Get the app:
``git clone <git endpoint>/gitlog.git``

Install app:
```sh
cd gitlog
npm install
```

Build and cp app to remote host
```sh
npm run build
# copy to remote host, I use linux containers (lxd)
tar cvf - public | ssh <remotehost> "cat > build.tar"
ssh <remotehost>
lxc file push build.tar <lxc> /root/build.tar
lxc exec <lxc> sh
cd /var/www/localhost
tar xvf /root/build.tar 
mv build gitlog
chown -R root.www-data gitlog
chmod -R u+rwX,g+rX gitlog
```

---
That should be it.
---
