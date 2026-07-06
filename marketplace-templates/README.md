OH 5.2+ YAML formatted files containing rule templates for the marketplace.

All the templates are in their own file.
For development, this folder can be checked out over the $OH_CONF/automation/templates folder.

```
# Clone the repository without downloading files
git clone --no-checkout git@github.com:rkoshak/openhab-rules-tools.git
mv openhab-rules-tools templates
cd templates

# Enable sparse checkout
git sparse-checkout set --no-cone
git sparse-checkout set "marketplace-templates/*"

# Define your target 
git sparse-checkout set marketplace-templates

# Download the contents
git checkout main
```