# AlleganWizard

The Allegan Internet Wizard company website.

## Running with Docker

**Prerequisites**

- Get git.
- The machine running the site must have Docker engine and Docker-Compose installed.
    - Install Docker: https://docs.docker.com/engine/installation/
    - Install Compose: https://docs.docker.com/compose/install/

**Running the app**

Clone the project and switch to the Docker branch:

        $ git clone git@github.com:cbaron/AlleganWizard.git
        $ cd AlleganWizard
        $ git checkout get-dat-docker
    
    
**Starting the container**

Use docker-compose to spin up the containers (it might take a few minutes
 the first time while images are downloaded)

        $ docker-compose up
        
**View the site in your browser**

Visit **http://localhost:8001** in your browser once the Docker containers
are done starting up.  The page should be visible.


## Deploying to DigitalOcean with SwarmBuilder

**Prerequisites**

- A Digital Ocean API key.
- The SwarmBuilder scripts, installed and configured:
    https://github.com/FutureDaysSoftware/SwarmBuilder
- This example assumes that you've added swarmbuilder to your path using
    swarmbuilder's `install-link.sh` script.
- Make sure that your DigitalOcean API key is set in the `swarmbuilder/config.sh` file.

**Deploy the AlleganWizard app**

    $ cd AlleganWizard
    $ swarmbuilder create mySwarm --compose-file docker-compose.yml --stack-name alleganwizard
    
You'll probably need to confirm the SSH connection when swarmbuilder attempts to SSH into your
new droplet for the first time.  Be ready to type 'yes'.

It'll take a few minutes for everything to finish, but then you should
be able to access the site in your browser on port 8001 of your droplet's IP.

You'll see the IP of your new droplet in the console window, or you can look
it up at https://cloud.digitalocean.com/droplets.

