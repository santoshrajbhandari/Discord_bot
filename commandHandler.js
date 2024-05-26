const { extendRoleAssignment, getRemainingTime, addRoleAssignment } = require('./database');
const config = require('./config.json');

const handleCommand = async (client, message) => {
    if (message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have permission to use this command.');
    }

    if (command === 'extend') {
        const userMention = message.mentions.users.first();
        const roleMention = message.mentions.roles.first();

        if (!userMention || !roleMention) {
            return message.reply('Usage: !extend @user @role');
        }

        const userId = userMention.id;
        const roleId = roleMention.id;

        try {
            const user = await client.users.fetch(userId);
            const guild = message.guild;
            const role = guild.roles.cache.get(roleId);

            if (!role) {
                return message.reply(`Role with ID ${roleId} not found.`);
            }

            const newAssignedDate = new Date(Date.now()).toISOString();
            const newExpirationDate = await extendRoleAssignment(userId, roleId, newAssignedDate);

            message.reply(`The VIP membership for user ${user.username} and ${role.name} has been extended by 6 months.`);

            user.send(`Your VIP membership has been extended for 6 months.`);

            // Add role to the user
            const member = await guild.members.fetch(userId);
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(role);
                addRoleAssignment(userId, roleId, newAssignedDate);
                message.reply(`${user.username} has been assigned the role ${role.name}.`);
            }
        } catch (error) {
            console.error('Error fetching user or role:', error);
            message.reply('There was an error fetching the user or role.');
        }
    } else if (command === 'check') {
        const userMention = message.mentions.users.first();
        const roleMention = message.mentions.roles.first();

        if (!userMention || !roleMention) {
            return message.reply('Usage: !check @user @role');
        }

        const userId = userMention.id;
        const roleId = roleMention.id;

        try {
            const user = await client.users.fetch(userId);
            const guild = message.guild;
            const role = guild.roles.cache.get(roleId);

            if (!role) {
                return message.reply(`Role with ID ${roleId} not found.`);
            }

            const remainingTime = await getRemainingTime(userId, roleId);

            if (remainingTime === null) {
                return message.reply(`No role assignment found for user ${user.username} and ${role.name}.`);
            }

            const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
            message.reply(`User ${user.username} has ${daysRemaining} days remaining until the ${role.name} expires.`);
        } catch (error) {
            console.error('Error fetching user or role:', error);
            message.reply('There was an error fetching the user or role.');
        }
    }
};

module.exports = { handleCommand };
