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

export const validateBirthday = ({
  birthday,
  required,
}: {
  birthday: string;
  required?: boolean;
}) => {
  if (!birthday && required) {
    throw {
      param: ["birthday"],
      msg: "Votre date de naissance est obligatoire.",
    };
  }
  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) {
    throw {
      param: ["birthday"],
      msg: "Le format de la date de naissance est invalide.",
    };
  }
  const isOver18 = () => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 18;
  };

  if (!isOver18()) {
    throw {
      param: ["birthday"],
      msg: "Vous devez avoir plus de 18 ans.",
    };
  }
};

export const validateRole = (role: string) => {
  if (role === "admin") {
    throw {
      param: ["role"],
      msg: "Vous ne pouvez pas créer un utilisateur avec le rôle admin.",
    };
  }
};

export const validateCGU = ({ cgu }: { cgu: boolean }) => {
  if (!cgu)
    throw {
      param: ["cgu"],
      msg: "Les conditions générales d'utilisation sont obligatoires.",
    };
};
