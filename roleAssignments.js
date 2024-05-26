const { addRoleAssignment } = require('./database');

const handleRoleAssignment = async (oldMember, newMember) => {
    newMember.roles.cache.forEach(async role => {
        if (!oldMember.roles.cache.has(role.id)) {
            // Role was added
            const assignedDate = new Date().toISOString();
            addRoleAssignment(newMember.id, role.id, assignedDate);

            try {
                // Send welcome message to member's inbox
                await newMember.send(`Welcome! ${newMember.user.username}. You’re now the part our trading family. Lets earn and grow together as a family`);
                console.log(`Welcome message sent to ${newMember.user.username}`);
            } catch (error) {
                if (error.code === 50007) {
                    console.error(`Cannot send messages to ${newMember.user.username}: User has disabled direct messages from server members.`);
                } else {
                    console.error(`Failed to send welcome message to ${newMember.user.username}: ${error.message}`);
                }
            }
        }
    });
};

module.exports = { handleRoleAssignment };
