const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const os = require("os");
const path = require("path");

const getMovies = (req, res) => {
  const pathToMovies =
    os.platform() === "win32" || os.platform() === "win64"
      ? path.join(__dirname, "..", "external", "movies", "info.json")
      : `/media/${os.userInfo().username}/EXTERNAL/movies/info.json`;

  fs.readFile(pathToMovies, (err, data) => {
    if (err) {
      return res.status(404).send("Data not found");
    } else {
      const newData = JSON.parse(data).map((e) => {
        e.Image = "static/movies/" + e.Image;
        e.file = "static/movies/" + e.file;

        e.subtitles.forEach((element) => {
          element.file = "static/movies/" + element.file;
        });
        return e;
      });

      return res.send(newData);
    }
  });
};

const getMusic = (req, res) => {
  const pathToMovies =
    os.platform() === "win32" || os.platform() === "win64"
      ? path.join(__dirname, "..", "external", "music", "info.json")
      : `/media/${os.userInfo().username}/EXTERNAL/music/info.json`;

  fs.readFile(pathToMovies, (err, data) => {
    if (err) {
      return res.status(404).send("Data not found");
    } else {
      const newData = JSON.parse(data).map((e) => {
        e.path = "static/music/" + e.path;
        e.img = "static/music/" + e.img;
        return e;
      });

      return res.send(newData);
    }
  });
};

const prisma = new PrismaClient();

const allUsers = async (req, res) => {
  try {
    const users = await prisma.User.findMany({
      where: {
        user_id: {
          not: req.user.user_id,
        },
      },
    });

    const groups = await prisma.Group.findMany({
      where: {
        UserGroup: {
          some: {
            userID: req.user.user_id,
            private: false,
          },
        },
      },
    });

    const blockList = await prisma.BlockList.findMany({
      where: {
        theBlocker: req.user.user_id,
      },
    });

    const blockedGroups = blockList.map((block) => block.blockedGroup);

    const blockedUserGroup = await prisma.UserGroup.findMany({
      where: {
        groupID: {
          in: blockedGroups,
        },
        userID: {
          not: req.user.user_id,
        },
      },
    });

    const usersWithBlocked = users.map((user) => {
      const group = blockedUserGroup.find((group) => group.userID === user.user_id);
      if (!group) return { ...user, blocked: false };
      const blockData = blockList.find((block) => block.blockedGroup === group.groupID);
      return {
        ...user,
        blocked: true,
        blockData,
      };
    });

    await prisma.$disconnect();

    // res.send({ users: users, groups: groups, user_id: req.user.user_id});
    res.send({ users: usersWithBlocked, groups: groups, user_id: req.user.user_id });
  } catch (err) {
    res.send({ error: err });
  }
};

const createSingleChat = async (req, res) => {
  const { userIds } = req.body;
  const { user_id } = req.user;

  if (!user_id || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).send({ error: "params missing" });
  }

  const allUserIds = [user_id, ...userIds];
  const uniqueUserIds = [...new Set(allUserIds)];
  const users = await prisma.User.findMany({
    where: {
      user_id: {
        in: uniqueUserIds,
      },
    },
  });
  await prisma.$disconnect();

  if (users.length !== uniqueUserIds.length) {
    return res.status(500).send({ error: "one or more users are not found" });
  }

  const privateChat = userIds.length === 1;

  if (privateChat) {
    const [otherUserId] = userIds;
    const privateGroups = await prisma.UserGroup.findMany({
      where: {
        userID: {
          in: [user_id, otherUserId],
        },
        private: true,
      },
    });
    await prisma.$disconnect();

    const groupIDs = privateGroups.map((item) => item.groupID);
    const duplicatedGroupIDs = groupIDs.filter((item, index) => groupIDs.indexOf(item) !== index);

    if (duplicatedGroupIDs.length > 0) {
      const group = await prisma.Group.findUnique({
        where: {
          group_id: duplicatedGroupIDs[0],
        },
      });

      const blocked = await prisma.BlockList.findUnique({
        where: {
          blockedGroup: duplicatedGroupIDs[0],
        },
      });

      if (blocked) {
        blocked["me"] = blocked["theBlocker"] != user_id;
      }
      await prisma.$disconnect();
      return res.send({
        error: "group already exists of the two given users",
        group: group,
        blocked: blocked,
      });
    }
  }

  try {
    const { name } = req.body;
    const group = await prisma.Group.create({ data: { group_name: name } });

    // Add all users to the group
    await Promise.all(
      uniqueUserIds.map((userId) =>
        prisma.UserGroup.create({
          data: {
            userID: userId,
            groupID: group.group_id,
            private: privateChat,
          },
        }),
      ),
    );
    await prisma.$disconnect();

    return res.send({ group });
  } catch (err) {
    return res.send({ error: err });
  }
};

const newMessage = async (req, res) => {
  if (!(req.body.groupID || req.body.content)) {
    return res.send({ error: "missing param" });
  }

  try {
    const data = await prisma.Message.create({
      data: {
        userID: req.user.user_id,
        groupID: req.body.groupID,
        content: req.body.content,
      },
    });

    await prisma.$disconnect();
    return res.send({ data });
  } catch (error) {
    return res.send({ error: "SomeError in DB" });
  }
};

const messageCollection = async (req, res) => {
  const { user_id } = req.user;
  try {
    const group = await prisma.Group.findUnique({
      where: {
        group_id: req.params.groupID,
      },
      include: {
        UserGroup: {
          include: {
            users: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return res.send({ error: "Group not found" });
    }

    await prisma.$disconnect();
    return res.send({ ...group, user: user_id });
  } catch (error) {
    return res.send({ error: "SomeError in DB" });
  }
};
const unblockUser = async (req, res) => {
  const { user_id } = req.user;
  const { theBlocker, blockedGroup } = req.body.blocked;

  console.log(theBlocker, user_id);

  if (user_id !== theBlocker) {
    return res.send({ error: "cant unblock someone you didnt block" });
  }

  try {
    await prisma.BlockList.delete({
      where: {
        blockedGroup: blockedGroup,
      },
    });
  } catch (error) {
    return res.send(error);
  }
  res.send({ mes: "succes" });
};

const blockUser = async (req, res) => {
  if (!(req.body.groupID || req.body.content)) {
    return res.send({ error: "missing param" });
  }
  console.log(req.body);

  try {
    const data = await prisma.BlockList.create({
      data: {
        theBlocker: req.user.user_id,
        blockedGroup: req.body.groupID,
      },
    });

    await prisma.$disconnect();
    return res.send({ data });
  } catch (error) {
    return res.send({ error: "SomeError in DB" });
  }
};

const leaveGroup = async (req, res) => {
  const { user_id } = req.user;
  const { group_id } = req.body;

  try {
    await prisma.userGroup.delete({
      where: {
        userID_groupID: {
          userID: user_id,
          groupID: group_id,
        },
      },
    });
  } catch (error) {
    return res.send(error);
  }
  res.send({ mes: "succes" });
};

// chats/getSomeUsers
const getAllUsersNotInGroup = async (req, res) => {
  if (!req.body.groupID) {
    return res.send({ err: "Error" });
  }

  const usersNotInGroup = await prisma.user.findMany({
    where: {
      NOT: {
        UserGroup: {
          some: {
            groupID: req.body.groupID,
          },
        },
      },
    },
  });

  return res.send(usersNotInGroup);
};

// chats/addUsersGroup
const addUserToGroup = async (req, res) => {
  const { userIds, groupId } = req.body;

  await Promise.all(
    userIds.map(async (userId) => {
      await prisma.userGroup.create({
        data: {
          userID: userId,
          groupID: groupId,
          private: false,
        },
      });
    }),
  );

  return res.send({ mes: "success" });
};

// chats/updateGroup
const updateGroupName = async (req, res) => {
  const { groupId, newName } = req.body;

  const updatedGroup = await prisma.group.update({
    where: {
      group_id: groupId,
    },
    data: {
      group_name: newName,
    },
  });

  res.send(updatedGroup);
};

module.exports = {
  getMusic,
  leaveGroup,
  allUsers,
  createSingleChat,
  newMessage,
  messageCollection,
  blockUser,
  unblockUser,
  getMovies,
  addUserToGroup,
  getAllUsersNotInGroup,
  updateGroupName,
};
