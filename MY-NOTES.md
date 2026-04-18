# MY NOTES
## To update n8n:

npm update -g n8n


## When you are ready to test your node, publish it locally:

npm run build
npm link

## Install the node into your local n8n instance:

# In the nodes directory within your n8n installation
# node-package-name is the name from the package.json

npm link <node-package-name>

npm link n8n-nodes-etsy


## Start n8n:
n8n start
