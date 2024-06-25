import User from "../../models/userModel";

export const existingEmail = async ({ email }: { email: string }) => {
  const existingEmail = await User.findOne({ where: { email: email } });
  if (existingEmail) {
    throw { param: ["email"], msg: "Cet email existe déjà.", status: 409 };
  }
};
export const emailExist = ({ email }: { email: string }) => {
  if (!email) {
    throw {
      param: ["email"],
      msg: "Votre email est obligatoire.",
    };
  }
};
export const emailFormat = ({ email }: { email: string }) => {
  if (email.length < 5 || email.length > 70) {
    throw {
      param: ["email"],
      msg: "Votre email doit contenir entre 5 et 70 caractères.",
    };
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
export const emailUpdate = ({
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
  if (!lastEmail) {
    throw {
      param: ["lastEmail"],
      msg: "L'ancien email est obligatoire.",
    };
  }
  if (!email) {
    throw {
      param: ["email"],
      msg: "L'email est obligatoire.",
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
