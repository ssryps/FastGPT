import { connectToDatabase } from '@/service/mongo';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import {authCert} from "@fastgpt/service/support/permission/auth/common";

export default async function handler(req, res) {
    const {
        query: { id },
        method,
    } = req;

    // await connectToDatabase();
    const { userId } = await authCert({ req, authToken: true });

    const curUser = await MongoUser.findById(userId);
    if (curUser.username !== 'root') {
        return res.status(200).json([]);
    }

    switch (method) {
        case 'GET':
            try {
                const user = await MongoUser.findById(id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.status(200).json(user);
            } catch (error) {
                res.status(500).json({ error: 'Error fetching user' });
            }
            break;

        case 'PUT':
            try {
                const { username, status, promotionRate, timezone, password } = req.body;
                const updateDoc = {
                    username,
                    status,
                    promotionRate,
                    timezone,
                };

                if (password) {
                    updateDoc.password = hashStr(password);
                }

                const user = await MongoUser.findByIdAndUpdate(id, updateDoc, {
                    new: true,
                    runValidators: true,
                });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.status(200).json(user);
            } catch (error) {
                res.status(500).json({ error: 'Error updating user' });
            }
            break;

        case 'DELETE':
            try {
                const deletedUser = await MongoUser.findByIdAndDelete(id);
                if (!deletedUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Remove user from teams
                await MongoTeamMember.deleteMany({ userId: id });

                // Delete teams owned by this user
                const ownedTeams = await MongoTeam.find({ ownerId: id });
                for (const team of ownedTeams) {
                    await MongoTeamMember.deleteMany({ teamId: team._id });
                    await MongoTeam.findByIdAndDelete(team._id);
                }

                res.status(200).json({ success: true });
            } catch (error) {
                res.status(500).json({ error: 'Error deleting user' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}