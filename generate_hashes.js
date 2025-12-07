const bcrypt = require("bcryptjs");
console.log("admin123:", bcrypt.hashSync("admin123", 10));
console.log("cliente123:", bcrypt.hashSync("cliente123", 10));

