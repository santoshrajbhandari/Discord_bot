# Discord Reminder Bot

## Description
This reminder bot logs the role assigned date to a particular user in discord server, notify and remove the user from role after certain period(in our case, 6 months). This bot can be used in server where you have membership system to access specific channels and you want to notify the user when their membership is about to expired and remove their role if membership expired.

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
## Installation
1. First you have to create and invite bot to your server from discord developer portal. Once your invite a bot to your server you can see the bot is offline in server.
2. Now replace your token and guildId/severId in config.json file.
3. Install all dependencies in root directory by Opening command prompt in this directory. Copy past following command:
   npm init -y
   npm install discord.js
   node index.js
   npm install sqlite3
5. Now to run the bot
   node index.js
6. Open your discord server, there you can see the bot is online.

## Usage
This bot is currently running on a discord server. When a new user join the discord server and user is assigned to VIP role the bot sent warm welcome text to the user notify that he/she is assigned to the VIP role/membership. The bot also send a reminder message to the user five day before expiration of role/membership and send another reminder message notifying one day left in expiration. If the renewing is not done within this period, the role is revoked from the user and notify the user. Additionally the admin can use "!check @userId @roleId" command to check days left for the expiration of role of particular user. Also admin can use "!extend @userId @roleId" command to extend the membership by 6 months.
