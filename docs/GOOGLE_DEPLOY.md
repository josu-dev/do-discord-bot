# GUIDE FOR DEPLOYING IN GOOGLE CLOUD COMPUTE ENGINE


This guide is for deploying a nodejs project in a google cloud compute engine instance.

There are two ways to deploy the project, the first one is deploying the project with a github action workflow and the second one is deploying the project manually.


## CI/CD deploy

This method uses a github action workflow to deploy the project in a google cloud compute engine instance.

### Prerequirements

- Have a Google Cloud account
- Have created a virtual machine and have a remote console started


### Repository setup

1. **Create the workflow file**

    In order to deploy the project with a github action workflow, the repository must have a workflow file.

    To create the file, go to the repository and click on the "Actions" tab, then click on "new workflow" and search for "Node.js" and select the "Node.js CI" template.

    Make the following changes to the file:

    ```yml
    jobs:
      build:
        runs-on: self-hosted

        strategy:
          matrix:
            node-version: [18.x]
        
        steps:

        - name: create env file
          run: |
            touch .env
            echo botToken=${{ secrets.BOT_TOKEN }} >> .env
            echo guildId=${{ secrets.GUILD_ID }} >> .env
            echo applicationId=${{ secrets.APPLICATION_ID }} >> .env
            echo enviromentIsDev=false >> .env
            echo enviromentIsProd=true >> .env
        - run: npm ci
        - run: npm run test --if-present
        - run: npm run build
        # - name: create temporal career picker select menu cache
        #   run: |
        #     mv ./src/generated/selectMenus/tmpCareer.json ./dist/generated/selectMenus/+generated/PICK_ROLES_career.cache.json
        - run: pm2 reload student-discord-bot || pm2 start dist/index.js --name student-discord-bot --time
    ```

    > *NOTE: the workflow file must be in the root of the repository*
    > *NOTE 2: the commented step is not more required since the feature can be done natively at the discord server level*

    Save the file and commit the changes.

2. **Create the secrets**

    Go to the repository settings and click on "Secrets" and create the following secrets:

    - APPLICATION_ID (the bot id)
    - BOT_TOKEN (the bot token)
    - GUILD_ID (the guild id)

3. **Create the runner**

    Go to the repository settings and click on "Actions" and then click on "Add runner" and select the linux verison with the architecture x64. After that leave the window open to use it later.

    > *NOTE: the runner must be a self-hosted runner*


### Virtual machine setup

Once the setup is done the bot will be started in the virtual machine and the bot will be ready to use. Also the workflow will be triggered every time a commit is made to the repository.

> _NOTES:_
> - _this setup assumes that the vm OS is devian_
> - _this setup assumes that the vm has a public ip_

#### Installations

The following installations are needed to deploy the project:

- Install git

    ```bash
    sudo apt-get update

    sudo apt-get install git

    # check if worked with the version

    git --version
    ```

- Install node, npm, n

    ```bash
    sudo su
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

    sudo apt install npm

    # check node version with node -v, in case that isn't the desired version:

    npm install -g n

    n lts
    # or
    n 18.x

    # n repo: https://github.com/tj/n
    ```

- Install pm2

    ```bash
    sudo npm install pm2@latest -g
    ```

    > [pm2 quickstart](https://pm2.keymetrics.io/docs/usage/quick-start/)


> _NOTE: aditional installation? [nvm](https://github.com/nvm-sh/nvm)_

#### Continue the runner setup

Follow the instructions for downloading and installing the runner in the window that was left open.

Then on the configuration section select the following options:

- Enter
- gce-instance-\[number]
- Enter
- Enter

#### Intall the svc

```bash
sudo su
./svc.sh install
./svc.sh start
```


### Updating

Updates should be done by pushing to the main branch, the workflow will run and deploy the changes.

In case that the workflow fails, the changes can be deployed manually.

The local repository in the vm will be in the following path:

```bash
cd $HOME/actions-runner/_work/gce-instance-2/student-bot/student-bot
```


### pm2 commands

```bash
# list all processes
pm2 list

# describe a process
pm2 describe student-discord-bot
# or
pm2 describe 0

# show last logs
pm2 logs --lines 100

# show logs of a process
pm2 logs student-discord-bot
# or
pm2 logs 0

# stop a process
pm2 stop student-discord-bot
# or
pm2 stop 0

# start a process
pm2 start student-discord-bot
# or
pm2 start 0
```

<br>

___

<br>


## Manual deploy

This method uses a remote console to deploy the project in a google cloud compute engine instance.

### Prerequirements

- Have a Google Cloud account
- Have created a virtual machine and have a remote console open
- The virtual machine OS is devian

### Installations

#### Install git

```bash
sudo apt-get update

sudo apt-get install git

# check if worked with the version

git --version

git config --global user.name "username"
git config --global user.email "user@email.com"
git config --global user.password "access token?"
```

> *NOTE: when clonning a repo with https remember that the password must be an [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)*

#### Install node, npm, n

```bash
sudo su
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

sudo apt install npm

# check node version with node -v, in case that isn't the desired version:

npm install -g n

n lts
# or
n 18.x

# n repo: https://github.com/tj/n
```

#### Install pm2

> [pm2 quickstart](https://pm2.keymetrics.io/docs/usage/quick-start/)

```bash
sudo npm install pm2@latest -g
```


### Clone the project

Go to the desire location for the bot

```bash
git clone https://github.com/username/repository-name.git

cd "repocitory-name"

npm install
```

### Create .env

```bash
nano .env

# write/add the followind variables

botToken=THE_BOT_TOKEN
guildId=THE_GUILD_ID
applicationId=THE_BOT_ID
enviromentIsDev=false
enviromentIsProd=true

# save and exit
```

### Build

```bash
npm run build
# or
tsc .
```

### First time Start

> old way to start `npm run start:prod > dist/running_stdout.txt 2> dist/running_stderr.txt &`

```bash
pm2 startup

# copy the output of the previus command and paste it back into the terminal. This configures pm2 to run as a daemon service.

pm2 start dist/index.js --name discord-bot-info --time

pm2 save
```

Notes

- At any point in the future, to update the list of process, just run pm2 save again
- **WARNING** pm2 unstartup terminates all user processes currently running under pm2
- Logs at '$HOME/.pm2/logs/'
- For a detailed description of the proccess `pm2 describe <id>`


<br>


### Update project

```bash
# ls to get the name or id of the proccess
pm2 ls

pm2 stop "<id>"

git pull
# if no able to pull run `git reset --hard`

npm run build

pm2 start "<id>"

# to check for start log
tail -n 32 $HOME/.pm2/logs/discord-bot-info-out.log
```
