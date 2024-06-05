import bcrypt from "bcrypt";

export const passwordExist = ({ password }: { password: string }) => {
  if (!password) {
    throw { param: ["password"], msg: "Le mot de passe est obligatoire." };
  }
};

export const passwordFormat = ({ password }: { password: string }) => {
  if (password.length < 7)
    throw {
      param: ["password"],
      msg: "Le mot de passe doit comporter plus de 7 caractères.",
    };
  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    throw {
      param: ["password"],
      msg: "Le mot de passe doit contenir au moins une majuscule.",
    };
  }

  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    throw {
      param: ["password"],
      msg: "Le mot de passe doit contenir au moins une minuscule.",
    };
  }

  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    throw {
      param: ["password"],
      msg: "Le mot de passe doit contenir au moins un chiffre.",
    };
  }

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    throw {
      param: ["password"],
      msg: "Le mot de passe doit contenir au moins un caractère spécial.",
    };
  }
};

export const passwordUpdate = ({
  password,
  confirmPassword,
  lastPassword,
}: {
  password: string;
  confirmPassword: string;
  lastPassword?: string;
}) => {
  if (password !== confirmPassword) {
    throw {
      param: ["confirmPassword"],
      msg: "Les mots de passe ne sont pas identiques.",
      status: 409,
    };
  }
  if (lastPassword) {
    if (lastPassword === password)
      throw {
        param: ["password"],
        msg: "Le mot de passe est identique à l’ancien mot de passe",
      };
  }
};
export const passwordCompare = async ({
  reqPassword,
  userPassword,
  notEmail = false,
}: {
  reqPassword: string;
  userPassword: string;
  notEmail?: boolean;
}) => {
  const validPassword = await bcrypt.compare(reqPassword, userPassword);
  if (!validPassword) {
    throw {
      param: notEmail ? ["password"] : ["email", "password"],
      msg: notEmail
        ? "Mot de passe incorrect."
        : "Email ou mot de passe incorrect.",
      status: 401,
    };
  }
};
