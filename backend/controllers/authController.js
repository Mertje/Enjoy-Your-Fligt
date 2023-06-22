const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// /login/:ticket_number
const login = async (req, res) => {
  try {
    const user = await prisma.User.findUnique({
      where: {
        ticket_number: req.params.ticket_number,
      },
    });

    if (user === null) {
      return res.status(400).send({ error: "no user found" });
    }

    const token = jwt.sign(user, process.env.AUTH_TOKEN, { expiresIn: "2h" });

    res.send({ user_token: token, user_name: user.username });
  } catch (error) {
    res.status(400).send({ error: "Somthing went wrong, user couldn't be found" });
  }
};

module.exports = { login };
