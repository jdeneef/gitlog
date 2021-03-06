# Git Log app

Gitlog is a svelte frontend only app I use to share my git commit calendars in github format.
Gitlog requires a script running from cron updating the git project logs, and an nginx webserver to serve this app and to serve the gitlog files in json format

example: <https://de-neef.net/gitlog>

## Installation

### Prepare git-server

Install this script on your git-server. I use git-shell, so should be installed in ``git-shell-commands`` directory

```sh
#!/bin/sh
# gitlog's update_gitlog script, run from cron daily

set -x

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
    rm -f $FO/* # cleanup old files
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

# cleanup old gitlogs
for i in $BD/*
do
  if [ -d $i ]; then
    [ ! -d $HOME/$i.git ] && rm -rf $i
  fi
done

exit 0
```

And add cron job:

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
                        # add_header Access-Control-Allow-Origin *;
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
tar cvf - public | ssh $SSH_REMOTE "cat > build.tar"
ssh $SSH_REMOTE
lxc file push build.tar $LXC_REMOTE /root/build.tar
lxc exec $LXC_REMOTE sh
cd /var/www/localhost
tar xvf /root/build.tar 
mv public gitlog
chown -R root.www-data gitlog
chmod -R u+rwX,g+rX gitlog
```

or in 1 go:
```
read -p "cp to $LXC_REMOTE via $SSH_REMOTE, continue? " -r -n 1 -t 5; [[ $REPLY =~ ^[Yy]$ ]] && npm run build && tar cvf - public | ssh $SSH_REMOTE "lxc exec $LXC_REMOTE -- sh -c 'cat > /var/www/localhost/public.tar; cd /var/www/localhost; tar xvf public.tar; chown -R root.www-data public; chmod -R u+rwX,g+rX-w,o-rwx public; rm -rf gitlog; mv public gitlog; rm public.tar'"
```

---
That should be it.
---
