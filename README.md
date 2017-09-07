# Sequr Importer Avatar

👤 a simple CLI to help you import avatars from different services in to ours

<div align="center">
	<img src="https://raw.githubusercontent.com/sequr/sequr-import-avatar/master/resources/screen_shot.png">
</div>

# How to install

Since this is a NPM package you'll need to have NodeJS in your system. After that you can just type the following command to install thsi tool.

```
sudo npm install -g @sequr/sequr-import-avatar
```

Once this part is done, you can run the app by typing: `sequr-avatar`.

# What else do I need

Before you start using this tool, you'll need to  grab a API Key from your Sequr dashboard - check this [page](https://access.sequr.io/settings/api-token). After that, you'll need to grab the credential from the service provider that you want to import the images from.

## BambooHR

Similar to Sequr, you can generate an API Key from your dashboard

## Pingboard

At this point Pingboard doesn't support fixed API Keys. To let our CLI do the work you'll have to provide the user name and password for the admin account.

**Important**: All the credentials are stored in RAM, and when the CLI quits all the data will be lost. We don't store any credentials on the hard drive. This means that at every execution you'll have to provide the credentials again.

**As a reminder**: Keep all your secrets in a secure place

# How to use

This is a CLI application with a simple ASCII UI which is going to guide you, and ask all the relevant questions.

We hope you'll find this tool useful.

# Contact

If you have any questions, please don't hesitate to send us an email at: support@sequr.io
