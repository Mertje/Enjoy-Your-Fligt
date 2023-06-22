const exec = require("child_process").exec;

const allowUser = (req, res) => {
  const ip = req.ip;
  exec(`iptables -I FORWARD -s ${ip} -j ACCEPT`);
};

const blockUser = (req, res) => {
  const ip = req.ip;
  exec(`iptables -D FORWARD -s ${ip} -j ACCEPT`);
};

module.exports = { blockUser, allowUser };
