// pages/api/users/index.js
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserType } from '@fastgpt/global/support/user/type.d';
import {NextAPI} from "@/service/middleware/entry";

 async function handler(req: NextApiRequest, res: NextApiResponse<any>) : Promise<UserType[]> {
    const { method } = req;
    // await connectToDatabase();

    const { userId } = await authCert({ req, authToken: true });

    const curUser = await MongoUser.findById(userId);
    if (curUser.username !== 'root') {
        return Promise.reject('Invalid account!');
    }

    switch (method) {
        case 'GET':
            try {
                const users = await MongoUser.find({});
                console.log('GET admin/users', users);
                return users;
            } catch (error) {
                console.log(error);
                return Promise.reject('数据库错误');
            }

        case 'POST':
            try {
                const { username, password, status, promotionRate, timezone } = req.body;

                // Check if user already exists
                const existingUser = await MongoUser.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                console.log('POST /api/users', password, hashStr(password), hashStr(hashStr(password)));
                // Hash password
                const hashedPassword = hashStr(password);

                const newUser = new MongoUser({
                    username,
                    password: hashedPassword,
                    status,
                    promotionRate,
                    timezone,
                });

                const savedUser = await newUser.save();

                // Create a new team for the user
                const team = new MongoTeam({
                    name: `${username}'s Team`,
                    ownerId: savedUser._id,
                });
                const savedTeam = await team.save();

                // Add user to team_members
                const teamMember = new MongoTeamMember({
                    teamId: savedTeam._id,
                    userId: savedUser._id,
                    name: 'Owner',
                    role: 'owner',
                    defaultTeam: true,
                });
                await teamMember.save();

                res.status(201).json({ success: true, user: savedUser.toObject({ versionKey: false, transform: (doc, ret) => { delete ret.password; return ret; } }) });
            } catch (error) {
                console.log(error);
                res.status(500).json({ error: 'Error creating user' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default NextAPI(handler);