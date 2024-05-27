//require('dotenv').config();//uncomment this for hosting bot
const { getAllAssignments, removeRoleAssignment } = require('./database');
const config = require('./config.json');

// Load environment variables
//const guildId = process.env.guildId;//uncomment this for hosting bot

let botUserId; // Variable to store bot's user ID

const checkExpirations = async (client) => {
    const sixMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds
    const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    const oneDayInMilliseconds = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const now = Date.now();

    // Retrieve bot's user ID
    botUserId = client.user.id;
    console.log('Bot user ID:', botUserId);

    try {
        const roleAssignments = await getAllAssignments();
        console.log('Role assignments retrieved:', roleAssignments);

        for (const assignment of roleAssignments) {
            if (assignment.userId === botUserId) {
                continue; // Skip the bot's user ID
            }

            console.log(`Processing assignment for user ${assignment.userId} and role ${assignment.roleId}`);

            const assignedDate = new Date(assignment.assignedDate).getTime();
            const expirationDate = assignedDate + sixMonthsInMilliseconds;
            const fiveDaysReminderDate = expirationDate - fiveDaysInMilliseconds;
            const oneDayReminderDate = expirationDate - oneDayInMilliseconds;

            const guild = client.guilds.cache.get(config.guildId);//remove config for hosting bot
            if (!guild) {
                console.error(`Guild not found: ${config.guildId}`);//remove config for hosting bot
                continue;
            }

            let member;
            try {
                member = await guild.members.fetch(assignment.userId);
                console.log(`Member fetched: ${member.user.username}`);
            } catch (error) {
                console.error(`Failed to fetch member ${assignment.userId}: ${error}`);
                continue;
            }

            const role = guild.roles.cache.get(assignment.roleId);
            if (!member || !role) {
                console.error(`Member or role not found. User ID: ${assignment.userId}, Role ID: ${assignment.roleId}`);
                removeRoleAssignment(assignment.userId, assignment.roleId);
                continue;
            }

            console.log(`Checking expiration for member ${member.user.username} with role ${role.name}`);

            if (now >= fiveDaysReminderDate && now < expirationDate) {
                try {
                    await member.send(`Hello! ${member.user.username}. You have only 5 days remaining of your VIP membership package. So, please follow the renewal process to further continue our trading journey.`);
                    console.log(`5-day reminder sent to ${member.user.username}`);
                } catch (error) {
                    console.error(`Failed to send 5-day reminder to ${member.user.username}: ${error}`);
                }
            }

            if (now >= oneDayReminderDate && now < expirationDate) {
                try {
                    await member.send(`Hello! ${member.user.username}. Today is the last day of your VIP membership package . So make sure to renew to continue being part of our trading family.`);
                    console.log(`1-day reminder sent to ${member.user.username}`);
                } catch (error) {
                    console.error(`Failed to send 1-day reminder to ${member.user.username}: ${error}`);
                }
            }

            if (now >= expirationDate) {
                try {
                    await member.roles.remove(role);
                    console.log(`Role ${role.name} removed from ${member.user.username}`);

                    // Verify role removal
                    const updatedMember = await guild.members.fetch(assignment.userId);
                    if (!updatedMember.roles.cache.has(role.id)) {
                        console.log(`Role ${role.name} successfully removed from ${member.user.username}`);
                    } else {
                        console.error(`Failed to remove role ${role.name} from ${member.user.username}`);
                    }

                    await member.send(`Hi! ${member.user.username}. Your vip membership has expired. It has been a pleasure trading with you for this long as a family. So best of luck for your trading journey. For queries you can contact us anytime without any hesitation`);
                } catch (error) {
                    console.error(`Failed to remove role from ${member.user.username}: ${error}`);
                }
                // Remove the assignment from the database after expiration
                removeRoleAssignment(assignment.userId, assignment.roleId);
            }
        }
    } catch (error) {
        console.error('Error retrieving role assignments:', error);
    }
};

module.exports = { checkExpirations };
