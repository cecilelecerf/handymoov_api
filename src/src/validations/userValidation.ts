import User from "../models/userModel";
import bcrypt from "bcrypt";

export const validateEmail = async ({
  email,
  required = true,
}: {
  email: string;
  required?: boolean;
}) => {
  if (!email && required) {
    throw { param: ["email"], msg: "Votre email est obligatoire." };
  }

  if (email.length < 5 || email.length > 70) {
    throw {
      param: ["email"],
      msg: "Votre email doit contenir entre 5 et 70 caractères.",
    };
  }

  const existingEmail = await User.findOne({ where: { email: email } });
  if (existingEmail) {
    throw { param: ["email"], msg: "Cet email existe déjà.", status: 409 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { param: ["email"], msg: "Le format de l'email est invalide." };
  }

  const [localPart, domainPart] = email.split("@");
  if (localPart.length < 1 || localPart.length > 40) {
    throw {
      param: ["email"],
      msg: "La partie avant l’arobase doit contenir entre 1 et 40 caractères.",
    };
  }

  if (domainPart.length < 4 || domainPart.length > 40) {
    throw {
      param: ["email"],
      msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
    };
  }
};

export const validateFirstname = ({
  firstname,
  required = true,
}: {
  firstname: string;
  required?: boolean;
}) => {
  if (!firstname && required) {
    throw { param: ["firstname"], msg: "Votre prénom est obligatoire." };
  }

  if (firstname.length < 5 || firstname.length > 50) {
    throw {
      param: ["firstname"],
      msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
    };
  }
};

export const validateLastname = ({
  lastname,
  required = true,
}: {
  lastname: string;
  required?: boolean;
}) => {
  if (!lastname && required) {
    throw { param: ["lastname"], msg: "Votre nom est obligatoire." };
  }

  if (lastname.length < 5 || lastname.length > 50) {
    throw {
      param: ["lastname"],
      msg: "Votre nom doit contenir entre 5 et 50 caractères.",
    };
  }
};

export const validatePassword = ({
  password,
  required = true,
}: {
  password: string;
  required?: boolean;
}) => {
  if (!password && required) {
    throw { param: ["password"], msg: "Le mot de passe est obligatoire." };
  }
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

export const validateConfirmPassword = ({
  password,
  confirmPassword,
  lastPassword,
  userPassword,
}: {
  password: string;
  confirmPassword: string;
  lastPassword?: string;
  userPassword?: string;
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

export const validateConfirmEmail = ({
  email,
  confirmEmail,
  lastEmail,
  userEmail,
}: {
  email: string;
  confirmEmail: string;
  lastEmail: string;
  userEmail: string;
}) => {
  if (!email) {
    throw {
      param: ["email"],
      msg: "L'email est obligatoire.",
    };
  }
  if (!lastEmail) {
    throw {
      param: ["lastEmail"],
      msg: "L'ancien email est obligatoire.",
    };
  }
  if (!confirmEmail) {
    throw {
      param: ["confirmEmail"],
      msg: "La confirmation d'email est obligatoire.",
    };
  }
  if (userEmail !== lastEmail)
    throw {
      param: ["lastEmail"],
      msg: "Email incorrect.",
    };
  if (email !== confirmEmail) {
    throw {
      param: ["confirmEmail"],
      msg: "Les emails ne sont pas identiques.",
      status: 409,
    };
  }
  if (email === lastEmail)
    throw {
      param: ["email"],
      msg: "Le nouvel email est similaire à celui déjà enregistré.",
    };
};

export const validateRole = (role: string) => {
  if (role === "admin") {
    throw {
      param: ["role"],
      msg: "Vous ne pouvez pas créer un utilisateur avec le rôle admin.",
    };
  }
};

export const validPassword = async ({
  reqPassword,
  userPassword,
}: {
  reqPassword: string;
  userPassword: string;
}) => {
  const validPassword = await bcrypt.compare(reqPassword, userPassword);
  if (!validPassword) {
    throw {
      param: ["email", "password"],
      msg: "Email ou mot de passe incorrect.",
      status: 401,
    };
  }
};
