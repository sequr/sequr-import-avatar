# Sequr Importer Avatar

👤 a simple CLI to help you import avatars from different services in to ours

# How to install

Since this is a NPM package you'll need to have in your system NodeJS. After that you can just type the following command

```
sudo npm install -g NAME
```

# What else do I need

Before you start using this tool, you'll need to grab all the necessary credentials so the tool can act on behalf of you. You;ll need to grab a API Key from our dashboard - check this [page](https://access.sequr.io/settings/api-token).

## BambooHR

Similar to Sequr, you can generate an API Key from your dashboard

## Pingboard

Sadly at this point Pingboard doesn't support fixed API Keys. To let our CLI do the work you'll have to provide the user name and password for the admin account.

**Important**: All the credentials are stored in RAM, and when the CLI quite all the credentials will be lost. We don't store any credentials on the hard drive. This means that at every execution you'll have to provide the credentials again.

**As a reminder**: Keep all your secrets in a secure place

# How to use

This is a CLI application with a simple ASCII UI which is going to guide you and ask all the relevant questions.

We hope you'll find this tool useful.